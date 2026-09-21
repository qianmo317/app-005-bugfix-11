import { configureStore, createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { storage } from '../utils/storage';
import { getMembershipLevel, syncMembershipFromRecords } from '../utils/membership';
import type {
  Customer,
  SkinAnalysis,
  Allergy,
  Membership,
  Service,
  Package,
  PackageItem,
  Employee,
  Appointment,
  ServiceRecord,
  Schedule,
  Review,
  Attendance,
  Commission,
  WaitList
} from '../types';
import {
  mockCustomers,
  mockSkinAnalyses,
  mockAllergies,
  mockMemberships,
  mockServices,
  mockPackages,
  mockPackageItems,
  mockEmployees,
  mockAppointments,
  mockServiceRecords,
  mockSchedules,
  mockReviews,
  mockAttendance,
  mockCommissions,
  mockWaitList
} from '../mock';

interface AppState {
  customers: Customer[];
  skinAnalyses: SkinAnalysis[];
  allergies: Allergy[];
  memberships: Membership[];
  services: Service[];
  packages: Package[];
  packageItems: PackageItem[];
  employees: Employee[];
  appointments: Appointment[];
  serviceRecords: ServiceRecord[];
  schedules: Schedule[];
  reviews: Review[];
  attendance: Attendance[];
  commissions: Commission[];
  waitList: WaitList[];
  initialized: boolean;
}

const STORAGE_KEY = 'app_state';

/**
 * 校正已持久化的旧数据，保证以下不变量：
 * 1. 所有关联数据（会员卡、皮肤分析、过敏史、消费记录、预约、评价、候补、提成）
 *    都必须挂在现存顾客/消费记录上，已删除顾客的残留一律清除；
 * 2. 每位顾客都有且只有一张会员卡；
 * 3. 会员卡的累计消费/积分/等级以其名下服务记录汇总为准，
 *    确保各页面显示的是同一套数字。
 */
const reconcileState = (state: AppState): AppState => {
  const customerIds = new Set(state.customers.map((c) => c.id));

  state.memberships = state.memberships.filter((m) => customerIds.has(m.customerId));
  state.skinAnalyses = state.skinAnalyses.filter((s) => customerIds.has(s.customerId));
  state.allergies = state.allergies.filter((a) => customerIds.has(a.customerId));
  state.serviceRecords = state.serviceRecords.filter((r) => customerIds.has(r.customerId));
  state.appointments = state.appointments.filter((a) => customerIds.has(a.customerId));
  state.reviews = state.reviews.filter((r) => customerIds.has(r.customerId));
  state.waitList = state.waitList.filter((w) => customerIds.has(w.customerId));

  const recordIds = new Set(state.serviceRecords.map((r) => r.id));
  state.commissions = state.commissions.filter((c) => recordIds.has(c.serviceRecordId));

  state.customers.forEach((customer) => {
    if (!state.memberships.some((m) => m.customerId === customer.id)) {
      state.memberships.push({
        id: `M-${customer.id}`,
        customerId: customer.id,
        level: 'bronze',
        points: 0,
        totalSpent: 0,
        joinDate: customer.createdAt.split('T')[0],
        expireDate: ''
      });
    }
  });

  state.memberships = state.memberships.map((m) =>
    syncMembershipFromRecords(m, state.serviceRecords)
  );

  return state;
};

const loadState = (): AppState => {
  try {
    const saved = storage.get<AppState>(STORAGE_KEY);
    if (saved && saved.initialized) {
      // Verify data integrity
      const firstCustomer = saved.customers[0];
      if (firstCustomer && firstCustomer.avatar && firstCustomer.avatar.includes('data:image/svg+xml;base64,')) {
        const b64 = firstCustomer.avatar.replace('data:image/svg+xml;base64,', '');
        try {
          atob(b64);
          return reconcileState(saved);
        } catch (e) {
          console.log('Detected corrupted data, regenerating...');
          storage.clear();
        }
      }
    }
  } catch (e) {
    console.log('Loading fresh data...');
  }

  const customers = mockCustomers();
  const customerIds = customers.map(c => c.id);
  const services = mockServices() as Service[];
  const serviceIds = services.map(s => s.id);
  const employees = mockEmployees() as Employee[];
  const employeeIds = employees.map(e => e.id);
  const packages = mockPackages() as Package[];
  const serviceRecords = mockServiceRecords(customerIds, serviceIds, employeeIds);

  return {
    customers,
    skinAnalyses: mockSkinAnalyses(customerIds),
    allergies: mockAllergies(customerIds),
    memberships: mockMemberships(customerIds, serviceRecords),
    services,
    packages,
    packageItems: mockPackageItems(packages),
    employees,
    appointments: mockAppointments(customerIds, serviceIds, employeeIds),
    serviceRecords,
    schedules: mockSchedules(employeeIds),
    reviews: mockReviews(customerIds, employeeIds, serviceIds),
    attendance: mockAttendance(employeeIds),
    commissions: mockCommissions(employeeIds),
    waitList: mockWaitList(customerIds, serviceIds),
    initialized: true
  };
};

const initialState: AppState = loadState();

const saveState = (state: AppState) => {
  storage.set(STORAGE_KEY, state);
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.unshift(action.payload);
      // 新顾客同步建立会员卡（青铜、累计消费 0），
      // 保证列表/详情/仪表板的会员统计口径一致
      const joinDate = action.payload.createdAt.split('T')[0];
      state.memberships.unshift({
        id: `M-${action.payload.id}`,
        customerId: action.payload.id,
        level: 'bronze',
        points: 0,
        totalSpent: 0,
        joinDate,
        expireDate: ''
      });
      saveState(state);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
        saveState(state);
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      const customerId = action.payload;
      // 级联清除该顾客的全部关联数据：会员卡、皮肤分析、过敏史、
      // 消费记录（及对应提成）、预约、评价、候补，保证各页面统计一致
      const removedRecordIds = new Set(
        state.serviceRecords.filter((r) => r.customerId === customerId).map((r) => r.id)
      );
      state.customers = state.customers.filter((c) => c.id !== customerId);
      state.memberships = state.memberships.filter((m) => m.customerId !== customerId);
      state.skinAnalyses = state.skinAnalyses.filter((s) => s.customerId !== customerId);
      state.allergies = state.allergies.filter((a) => a.customerId !== customerId);
      state.serviceRecords = state.serviceRecords.filter((r) => r.customerId !== customerId);
      state.commissions = state.commissions.filter((c) => !removedRecordIds.has(c.serviceRecordId));
      state.appointments = state.appointments.filter((a) => a.customerId !== customerId);
      state.reviews = state.reviews.filter((r) => r.customerId !== customerId);
      state.waitList = state.waitList.filter((w) => w.customerId !== customerId);
      saveState(state);
    },
    addSkinAnalysis: (state, action: PayloadAction<SkinAnalysis>) => {
      state.skinAnalyses.unshift(action.payload);
      saveState(state);
    },
    addAllergy: (state, action: PayloadAction<Allergy>) => {
      state.allergies.unshift(action.payload);
      saveState(state);
    },
    updateAllergy: (state, action: PayloadAction<Allergy>) => {
      const index = state.allergies.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.allergies[index] = action.payload;
        saveState(state);
      }
    },
    deleteAllergy: (state, action: PayloadAction<string>) => {
      state.allergies = state.allergies.filter(a => a.id !== action.payload);
      saveState(state);
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.services.unshift(action.payload);
      saveState(state);
    },
    updateService: (state, action: PayloadAction<Service>) => {
      const index = state.services.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
        saveState(state);
      }
    },
    deleteService: (state, action: PayloadAction<string>) => {
      state.services = state.services.filter(s => s.id !== action.payload);
      saveState(state);
    },
    addPackage: (state, action: PayloadAction<Package>) => {
      state.packages.unshift(action.payload);
      saveState(state);
    },
    updatePackage: (state, action: PayloadAction<Package>) => {
      const index = state.packages.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.packages[index] = action.payload;
        saveState(state);
      }
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.unshift(action.payload);
      saveState(state);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
        saveState(state);
      }
    },
    deleteAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(a => a.id !== action.payload);
      saveState(state);
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.unshift(action.payload);
      saveState(state);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
        saveState(state);
      }
    },
    updateSchedule: (state, action: PayloadAction<Schedule>) => {
      const index = state.schedules.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.schedules[index] = action.payload;
      } else {
        state.schedules.push(action.payload);
      }
      saveState(state);
    },
    addWaitList: (state, action: PayloadAction<WaitList>) => {
      state.waitList.unshift(action.payload);
      saveState(state);
    },
    updateWaitList: (state, action: PayloadAction<WaitList>) => {
      const index = state.waitList.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.waitList[index] = action.payload;
        saveState(state);
      }
    },
    deleteWaitList: (state, action: PayloadAction<string>) => {
      state.waitList = state.waitList.filter(w => w.id !== action.payload);
      saveState(state);
    },
    addServiceRecord: (state, action: PayloadAction<ServiceRecord>) => {
      state.serviceRecords.unshift(action.payload);
      const membership = state.memberships.find(m => m.customerId === action.payload.customerId);
      if (membership) {
        membership.totalSpent += action.payload.price;
        membership.points += Math.floor(action.payload.price / 10);
        membership.level = getMembershipLevel(membership.totalSpent);
      }
      saveState(state);
    }
  }
});

export const {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addSkinAnalysis,
  addAllergy,
  updateAllergy,
  deleteAllergy,
  addService,
  updateService,
  deleteService,
  addPackage,
  updatePackage,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  addEmployee,
  updateEmployee,
  updateSchedule,
  addWaitList,
  updateWaitList,
  deleteWaitList,
  addServiceRecord
} = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
