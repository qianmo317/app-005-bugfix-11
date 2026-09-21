import { configureStore, createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { storage } from '../utils/storage';
import { generateId } from '../utils/format';
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
  mockWaitList,
  getMembershipLevel
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

// 根据服务记录重算每位顾客的会员累计消费/积分/等级，作为全系统唯一口径
const reconcileMemberships = (state: AppState): Membership[] => {
  const spentMap = new Map<string, number>();
  state.serviceRecords.forEach((record) => {
    spentMap.set(record.customerId, (spentMap.get(record.customerId) || 0) + record.price);
  });

  return state.customers.map((customer) => {
    const existing = state.memberships.find((m) => m.customerId === customer.id);
    const totalSpent = spentMap.get(customer.id) || 0;
    const points = Math.floor(totalSpent / 10);
    if (existing) {
      return { ...existing, totalSpent, points, level: getMembershipLevel(totalSpent) };
    }
    // 新建档顾客若没有会员卡，补一张初始（青铜）卡
    return {
      id: generateId(),
      customerId: customer.id,
      level: 'bronze',
      points: 0,
      totalSpent: 0,
      joinDate: customer.createdAt,
      expireDate: '',
    };
  });
};

const loadState = (): AppState => {
  const buildFreshState = (): AppState => {
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
      memberships: mockMemberships(customers, serviceRecords),
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

  let state: AppState | null = null;
  try {
    const saved = storage.get<AppState>(STORAGE_KEY);
    if (saved && saved.initialized) {
      // Verify data integrity
      const firstCustomer = saved.customers[0];
      if (firstCustomer && firstCustomer.avatar && firstCustomer.avatar.includes('data:image/svg+xml;base64,')) {
        const b64 = firstCustomer.avatar.replace('data:image/svg+xml;base64,', '');
        try {
          atob(b64);
          state = saved;
        } catch (e) {
          console.log('Detected corrupted data, regenerating...');
          storage.clear();
        }
      } else {
        state = saved;
      }
    }
  } catch (e) {
    console.log('Loading fresh data...');
  }

  if (!state) {
    state = buildFreshState();
  }

  // 以服务记录为准对账会员数据，并清理指向已删除顾客的孤儿记录
  state.memberships = reconcileMemberships(state);
  const customerIds = new Set(state.customers.map((c) => c.id));
  state.skinAnalyses = state.skinAnalyses.filter((s) => customerIds.has(s.customerId));
  state.allergies = state.allergies.filter((a) => customerIds.has(a.customerId));
  state.appointments = state.appointments.filter((a) => customerIds.has(a.customerId));
  state.reviews = state.reviews.filter((r) => customerIds.has(r.customerId));
  state.waitList = state.waitList.filter((w) => customerIds.has(w.customerId));
  const recordIds = new Set(state.serviceRecords.map((r) => r.id));
  state.commissions = state.commissions.filter((c) => recordIds.has(c.serviceRecordId));

  return state;
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
      // 新顾客同步建档初始会员卡，保证各页面都能取到等级与累计消费
      state.memberships.unshift({
        id: generateId(),
        customerId: action.payload.id,
        level: 'bronze',
        points: 0,
        totalSpent: 0,
        joinDate: action.payload.createdAt,
        expireDate: '',
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
      // 级联删除该顾客的全部关联记录：历史业务数据不再参与任何统计
      state.customers = state.customers.filter(c => c.id !== customerId);
      state.memberships = state.memberships.filter(m => m.customerId !== customerId);
      state.skinAnalyses = state.skinAnalyses.filter(s => s.customerId !== customerId);
      state.allergies = state.allergies.filter(a => a.customerId !== customerId);
      state.appointments = state.appointments.filter(a => a.customerId !== customerId);
      state.reviews = state.reviews.filter(r => r.customerId !== customerId);
      state.waitList = state.waitList.filter(w => w.customerId !== customerId);
      const removedRecordIds = new Set(
        state.serviceRecords
          .filter(r => r.customerId === customerId)
          .map(r => r.id)
      );
      state.serviceRecords = state.serviceRecords.filter(r => r.customerId !== customerId);
      // 挂在其服务单上的提成记录一并删除，员工排行/提成统计才会同步扣减
      state.commissions = state.commissions.filter(c => !removedRecordIds.has(c.serviceRecordId));
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
        membership.points = Math.floor(membership.totalSpent / 10);
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
