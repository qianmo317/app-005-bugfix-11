import Mock from 'mockjs';

const Random = Mock.Random;

const avatarColors = [
  '#E8C1BA', '#D4A0A0', '#F8B4B4', '#C9A86C',
  '#B8D4E3', '#A5D6A7', '#CE93D8', '#FFAB91'
];

const encodeBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const generateAvatar = (name: string): string => {
  const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  const initial = name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="${color}"/>
      <text x="32" y="38" font-size="24" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-weight="bold">${initial}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${encodeBase64(svg)}`;
};

export const mockCustomers = () => {
  const customers = [];
  const names = [
    '王雅婷', '李佳琪', '张美琳', '刘思雨', '陈静怡',
    '杨雪婷', '赵美玲', '黄丽娟', '周梦琪', '吴芳萍',
    '徐晓雯', '孙婉如', '马雅琴', '朱丽华', '胡晓燕',
    '郭婉婷', '何美华', '高思涵', '林雅莉', '罗晓梅',
    '郑玉婷', '梁美玲', '谢雅芳', '宋佳琪', '唐思颖',
    '韩雪芳', '冯婉清', '邓雅静', '曹美玲', '彭思雨',
    '曾雅琴', '萧美玲', '田雅婷', '董思琪', '潘美玲',
    '袁婉如', '蒋雅莉', '蔡晓燕', '余美玲', '杜雅婷',
    '叶思雨', '程美玲', '苏雅芳', '魏佳琪', '吕思颖',
    '丁雪芳', '任婉清', '沈雅静', '姚美玲', '卢思雨'
  ];

  for (let i = 0; i < 50; i++) {
    const name = names[i] || Random.cname();
    customers.push({
      id: `C${String(i + 1).padStart(4, '0')}`,
      name,
      phone: `1${Random.integer(3, 9)}${Random.string('number', 9)}`,
      birthday: Random.date('yyyy-MM-dd'),
      gender: 'female',
      avatar: generateAvatar(name),
      address: Random.city() + Random.county(),
      skinType: ['干性', '油性', '混合性', '敏感肌', '中性'][Random.integer(0, 4)],
      notes: Random.cparagraph(1),
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss')
    });
  }
  return customers;
};

export const mockSkinAnalyses = (customerIds: string[]) => {
  const analyses = [];
  const skinTypes = ['干性', '油性', '混合性', '敏感肌', '中性'];
  const conditions = ['良好', '一般', '需改善', '较差'];

  customerIds.forEach((customerId, index) => {
    const count = Random.integer(1, 5);
    for (let i = 0; i < count; i++) {
      analyses.push({
        id: `SA${String(analyses.length + 1).padStart(6, '0')}`,
        customerId,
        analysisDate: Random.datetime('yyyy-MM-dd'),
        skinType: skinTypes[Random.integer(0, 4)],
        oiliness: ['偏低', '正常', '偏高'][Random.integer(0, 2)],
        moisture: ['偏低', '正常', '偏高'][Random.integer(0, 2)],
        elasticity: ['良好', '一般', '需改善'][Random.integer(0, 2)],
        sensitivity: ['无', '轻微', '明显'][Random.integer(0, 2)],
        skinCondition: conditions[Random.integer(0, 3)],
        recommendations: Random.cparagraph(1)
      });
    }
  });
  return analyses;
};

export const mockAllergies = (customerIds: string[]) => {
  const allergies = [];
  const allergens = ['花粉', '海鲜', '酒精', '香料', '防腐剂', '染发剂', '金属'];
  const severities = ['mild', 'moderate', 'severe'];

  customerIds.forEach((customerId) => {
    if (Math.random() > 0.6) {
      const count = Random.integer(1, 3);
      for (let i = 0; i < count; i++) {
        allergies.push({
          id: `AL${String(allergies.length + 1).padStart(6, '0')}`,
          customerId,
          allergen: allergens[Random.integer(0, 6)],
          severity: severities[Random.integer(0, 2)],
          discoveredDate: Random.datetime('yyyy-MM-dd'),
          notes: Random.cparagraph(1)
        });
      }
    }
  });
  return allergies;
};

export const mockMemberships = (customerIds: string[]) => {
  const memberships = [];
  const levels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  customerIds.forEach((customerId) => {
    const totalSpent = Random.integer(500, 50000);
    let level = 'bronze';
    if (totalSpent > 30000) level = 'diamond';
    else if (totalSpent > 20000) level = 'platinum';
    else if (totalSpent > 10000) level = 'gold';
    else if (totalSpent > 5000) level = 'silver';

    memberships.push({
      id: `M${String(memberships.length + 1).padStart(6, '0')}`,
      customerId,
      level,
      points: Math.floor(totalSpent / 10),
      totalSpent,
      joinDate: Random.datetime('yyyy-MM-dd'),
      expireDate: '2026-12-31'
    });
  });
  return memberships;
};

export const mockServices = () => {
  const services = [
    { id: 'S001', name: '深层清洁护理', category: '面部护理', duration: 60, price: 388, description: '深层清洁毛孔，去除角质和黑头', suitableSkin: ['油性', '混合性'], effectDescription: '毛孔清爽，肌肤透亮', imageUrl: '' },
    { id: 'S002', name: '补水保湿护理', category: '面部护理', duration: 75, price: 488, description: '深层补水，锁住水分', suitableSkin: ['干性', '中性'], effectDescription: '水润饱满，弹性十足', imageUrl: '' },
    { id: 'S003', name: '美白焕肤护理', category: '面部护理', duration: 90, price: 688, description: '淡化色斑，提亮肤色', suitableSkin: ['中性', '混合性'], effectDescription: '肤色均匀，透亮白皙', imageUrl: '' },
    { id: 'S004', name: '抗衰紧致护理', category: '面部护理', duration: 90, price: 888, description: '提升紧致，减淡细纹', suitableSkin: ['中性', '干性'], effectDescription: '紧致提拉，年轻焕发', imageUrl: '' },
    { id: 'S005', name: '敏感肌舒缓护理', category: '面部护理', duration: 60, price: 458, description: '舒缓镇静，修复屏障', suitableSkin: ['敏感肌'], effectDescription: '舒缓镇静，屏障修复', imageUrl: '' },
    { id: 'S006', name: '黄金焕肤护理', category: '面部护理', duration: 120, price: 1288, description: '黄金精华导入，奢华护理', suitableSkin: ['中性', '干性'], effectDescription: '奢华滋养，焕发光彩', imageUrl: '' },
    { id: 'S007', name: '眼部护理', category: '眼部护理', duration: 45, price: 288, description: '淡化黑眼圈，减淡细纹', suitableSkin: ['中性', '干性', '混合性'], effectDescription: '明眸亮彩，减淡细纹', imageUrl: '' },
    { id: 'S008', name: '颈肩舒缓按摩', category: '身体护理', duration: 60, price: 358, description: '舒缓颈肩疲劳，放松肌肉', suitableSkin: ['中性', '干性', '油性', '混合性', '敏感肌'], effectDescription: '舒缓放松，缓解疲劳', imageUrl: '' },
    { id: 'S009', name: '全身芳香SPA', category: '身体护理', duration: 90, price: 688, description: '精油按摩，身心放松', suitableSkin: ['中性', '干性', '油性', '混合性'], effectDescription: '身心放松，焕活能量', imageUrl: '' },
    { id: 'S010', name: '身体去角质', category: '身体护理', duration: 60, price: 388, description: '去除死皮，嫩滑肌肤', suitableSkin: ['中性', '干性', '油性', '混合性'], effectDescription: '肌肤嫩滑，焕然一新', imageUrl: '' },
    { id: 'S011', name: '纤体塑形', category: '身体护理', duration: 90, price: 788, description: '塑形紧致，纤体美肤', suitableSkin: ['中性', '干性', '混合性'], effectDescription: '紧致塑形，体态优美', imageUrl: '' },
    { id: 'S012', name: '胸部护理', category: '身体护理', duration: 60, price: 488, description: '胸部保养，提升紧实', suitableSkin: ['中性', '干性'], effectDescription: '紧实提升，健康美丽', imageUrl: '' },
    { id: 'S013', name: '头皮护理', category: '头发护理', duration: 45, price: 258, description: '深层清洁头皮，舒缓头皮', suitableSkin: ['中性', '干性', '油性'], effectDescription: '头皮清爽，秀发健康', imageUrl: '' },
    { id: 'S014', name: '毛囊修护护理', category: '头发护理', duration: 60, price: 388, description: '修护毛囊，强韧发根', suitableSkin: ['中性', '干性', '油性'], effectDescription: '强韧发根，减少脱发', imageUrl: '' },
    { id: 'S015', name: '美甲护理', category: '美甲', duration: 45, price: 128, description: '指甲保养，美化指甲', suitableSkin: ['中性', '干性', '油性', '混合性', '敏感肌'], effectDescription: '指甲美丽，双手迷人', imageUrl: '' },
    { id: 'S016', name: '光疗美甲', category: '美甲', duration: 60, price: 258, description: '持久光疗，色彩亮丽', suitableSkin: ['中性', '干性', '油性', '混合性'], effectDescription: '持久亮丽，时尚美丽', imageUrl: '' },
    { id: 'S017', name: '脱毛护理', category: '脱毛', duration: 30, price: 198, description: '腋下脱毛，光滑肌肤', suitableSkin: ['中性', '干性', '油性', '混合性'], effectDescription: '光滑如丝，美丽无瑕', imageUrl: '' },
    { id: 'S018', name: '全身脱毛', category: '脱毛', duration: 120, price: 888, description: '全身脱毛，彻底光滑', suitableSkin: ['中性', '干性', '混合性'], effectDescription: '全身光滑，美丽无瑕', imageUrl: '' },
    { id: 'S019', name: '肩颈背按摩', category: '身体护理', duration: 45, price: 298, description: '肩颈背按摩，缓解疲劳', suitableSkin: ['中性', '干性', '油性', '混合性', '敏感肌'], effectDescription: '疲劳缓解，身心舒畅', imageUrl: '' },
    { id: 'S020', name: '面部刮痧', category: '面部护理', duration: 45, price: 328, description: '面部刮痧，促进循环', suitableSkin: ['中性', '干性', '混合性'], effectDescription: '促进循环，焕发光彩', imageUrl: '' }
  ];
  return services.map(s => ({ ...s, status: 'active' }));
};

export const mockPackages = () => {
  const packages = [
    { id: 'P001', name: '焕颜美肤套餐', price: 1888, originalPrice: 2420, validityDays: 90, description: '包含3次深层清洁+2次补水保湿', imageUrl: '' },
    { id: 'P002', name: '紧致抗衰套餐', price: 2888, originalPrice: 3552, validityDays: 90, description: '包含2次抗衰紧致+2次眼部护理+1次面部刮痧', imageUrl: '' },
    { id: 'P003', name: '水嫩美肌套餐', price: 1588, originalPrice: 1952, validityDays: 60, description: '包含4次补水保湿护理', imageUrl: '' },
    { id: 'P004', name: '全身放松套餐', price: 1988, originalPrice: 2520, validityDays: 90, description: '包含2次全身SPA+2次肩颈按摩', imageUrl: '' },
    { id: 'P005', name: '尊享VIP套餐', price: 5888, originalPrice: 7744, validityDays: 180, description: '包含10次精选护理，全方位美容体验', imageUrl: '' },
    { id: 'P006', name: '夏日清爽套餐', price: 1288, originalPrice: 1564, validityDays: 60, description: '包含3次脱毛护理+2次身体去角质', imageUrl: '' },
    { id: 'P007', name: '新娘护理套餐', price: 3888, originalPrice: 4648, validityDays: 60, description: '包含5次精选护理，婚前焕颜必备', imageUrl: '' },
    { id: 'P008', name: '妈咪恢复套餐', price: 2688, originalPrice: 3176, validityDays: 90, description: '包含胸部护理+纤体塑形+身体护理', imageUrl: '' }
  ];
  return packages.map(p => ({ ...p, status: 'active' }));
};

export const mockPackageItems = (packages: ReturnType<typeof mockPackages>) => {
  const items = [];
  const serviceIds = ['S001', 'S002', 'S003', 'S004', 'S007', 'S008', 'S009', 'S010', 'S011', 'S012', 'S017', 'S020'];

  packages.forEach((pkg) => {
    const count = Random.integer(2, 5);
    const usedServices = new Set<string>();
    for (let i = 0; i < count; i++) {
      let serviceId;
      do {
        serviceId = serviceIds[Random.integer(0, serviceIds.length - 1)];
      } while (usedServices.has(serviceId));
      usedServices.add(serviceId);

      items.push({
        id: `PI${String(items.length + 1).padStart(6, '0')}`,
        packageId: pkg.id,
        serviceId,
        count: Random.integer(1, 4)
      });
    }
  });
  return items;
};

export const mockEmployees = () => {
  const employees = [
    { id: 'E001', name: '张美容', role: 'beautician', phone: '13800138001', hireDate: '2020-03-15', baseSalary: 5000, commissionRate: 0.15, skills: ['S001', 'S002', 'S003', 'S005', 'S020'], status: 'active' },
    { id: 'E002', name: '李美容', role: 'beautician', phone: '13800138002', hireDate: '2021-06-20', baseSalary: 4500, commissionRate: 0.12, skills: ['S001', 'S002', 'S007', 'S020'], status: 'active' },
    { id: 'E003', name: '王技师', role: 'technician', phone: '13800138003', hireDate: '2019-08-10', baseSalary: 6000, commissionRate: 0.18, skills: ['S004', 'S006', 'S007', 'S011', 'S012'], status: 'active' },
    { id: 'E004', name: '赵美容', role: 'beautician', phone: '13800138004', hireDate: '2022-01-15', baseSalary: 4000, commissionRate: 0.10, skills: ['S001', 'S005', 'S008', 'S019'], status: 'active' },
    { id: 'E005', name: '刘技师', role: 'technician', phone: '13800138005', hireDate: '2020-11-05', baseSalary: 5500, commissionRate: 0.15, skills: ['S009', 'S010', 'S011', 'S017', 'S018'], status: 'active' },
    { id: 'E006', name: '陈美容', role: 'beautician', phone: '13800138006', hireDate: '2021-09-12', baseSalary: 4200, commissionRate: 0.12, skills: ['S013', 'S014', 'S015', 'S016'], status: 'active' },
    { id: 'E007', name: '孙店长', role: 'manager', phone: '13800138007', hireDate: '2018-05-20', baseSalary: 8000, commissionRate: 0.05, skills: ['S001', 'S002', 'S003', 'S004'], status: 'active' },
    { id: 'E008', name: '周前台', role: 'receptionist', phone: '13800138008', hireDate: '2023-02-01', baseSalary: 3500, commissionRate: 0, skills: [], status: 'active' },
    { id: 'E009', name: '吴美容', role: 'beautician', phone: '13800138009', hireDate: '2022-07-18', baseSalary: 3800, commissionRate: 0.10, skills: ['S001', 'S002', 'S008', 'S015'], status: 'active' },
    { id: 'E010', name: '郑技师', role: 'technician', phone: '13800138010', hireDate: '2021-03-25', baseSalary: 5200, commissionRate: 0.14, skills: ['S006', 'S011', 'S012', 'S017', 'S018'], status: 'active' }
  ];

  return employees.map(e => ({ ...e, avatar: generateAvatar(e.name) }));
};

export const mockAppointments = (
  customerIds: string[],
  serviceIds: string[],
  employeeIds: string[]
) => {
  const appointments = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
  const sources = ['phone', 'wechat', 'walk_in', 'online'];

  for (let i = 0; i < 150; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Random.integer(1, 30));
    startDate.setHours(Random.integer(9, 20), Random.integer(0, 59));

    const duration = [30, 45, 60, 75, 90, 120][Random.integer(0, 5)];
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    appointments.push({
      id: `A${String(i + 1).padStart(6, '0')}`,
      customerId: customerIds[Random.integer(0, customerIds.length - 1)],
      serviceId: serviceIds[Random.integer(0, serviceIds.length - 1)],
      employeeId: employeeIds[Random.integer(0, employeeIds.length - 1)],
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      duration,
      status: statuses[Random.integer(0, 4)],
      source: sources[Random.integer(0, 3)],
      notes: Random.cparagraph(1),
      reminderSent: Math.random() > 0.3
    });
  }
  return appointments;
};

export const mockServiceRecords = (
  customerIds: string[],
  serviceIds: string[],
  employeeIds: string[]
) => {
  const records = [];
  for (let i = 0; i < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Random.integer(1, 60));

    records.push({
      id: `SR${String(i + 1).padStart(6, '0')}`,
      customerId: customerIds[Random.integer(0, customerIds.length - 1)],
      serviceId: serviceIds[Random.integer(0, serviceIds.length - 1)],
      employeeId: employeeIds[Random.integer(0, employeeIds.length - 1)],
      serviceDate: date.toISOString(),
      price: Random.integer(200, 1500),
      notes: Random.cparagraph(1)
    });
  }
  return records;
};

export const mockSchedules = (employeeIds: string[]) => {
  const schedules = [];
  const shiftTypes = ['morning', 'afternoon', 'full_day', 'off'];

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - 7 + i);
    const dateStr = date.toISOString().split('T')[0];

    employeeIds.forEach((employeeId) => {
      const shiftType = shiftTypes[Random.integer(0, 3)];
      let startTime = '09:00';
      let endTime = '18:00';

      if (shiftType === 'morning') {
        startTime = '09:00';
        endTime = '14:00';
      } else if (shiftType === 'afternoon') {
        startTime = '14:00';
        endTime = '21:00';
      } else if (shiftType === 'off') {
        startTime = '--';
        endTime = '--';
      } else if (shiftType === 'full_day') {
        startTime = '09:00';
        endTime = '21:00';
      }

      schedules.push({
        id: `SC${String(schedules.length + 1).padStart(6, '0')}`,
        employeeId,
        date: dateStr,
        shiftType,
        startTime,
        endTime
      });
    });
  }
  return schedules;
};

export const mockReviews = (
  customerIds: string[],
  employeeIds: string[],
  serviceIds: string[]
) => {
  const reviews = [];
  const comments = [
    '服务非常专业，效果明显！',
    '美容师很有耐心，体验很棒！',
    '环境舒适，推荐！',
    '效果超出预期，会再来！',
    '手法专业，推荐这家店！',
    '整体体验很好，服务态度也好！',
    '性价比高，值得推荐！',
    '护理效果很好，皮肤变好了！'
  ];

  for (let i = 0; i < 80; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Random.integer(1, 45));

    reviews.push({
      id: `R${String(i + 1).padStart(6, '0')}`,
      employeeId: employeeIds[Random.integer(0, employeeIds.length - 1)],
      customerId: customerIds[Random.integer(0, customerIds.length - 1)],
      serviceId: serviceIds[Random.integer(0, serviceIds.length - 1)],
      rating: Random.integer(3, 5),
      comment: comments[Random.integer(0, 7)],
      reviewDate: date.toISOString()
    });
  }
  return reviews;
};

export const mockAttendance = (employeeIds: string[]) => {
  const records = [];
  const statuses = ['present', 'present', 'present', 'present', 'late', 'leave', 'absent'];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - 30 + i);
    const dateStr = date.toISOString().split('T')[0];

    employeeIds.forEach((employeeId) => {
      const status = statuses[Random.integer(0, 6)];
      let checkIn = '--';
      let checkOut = '--';

      if (status === 'present') {
        checkIn = `09:0${Random.integer(0, 9)}`;
        checkOut = `18:0${Random.integer(0, 9)}`;
      } else if (status === 'late') {
        checkIn = `09:${Random.integer(15, 59)}`;
        checkOut = `18:0${Random.integer(0, 9)}`;
      }

      records.push({
        id: `AT${String(records.length + 1).padStart(6, '0')}`,
        employeeId,
        date: dateStr,
        checkIn,
        checkOut,
        status
      });
    });
  }
  return records;
};

export const mockCommissions = (employeeIds: string[]) => {
  const commissions = [];
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Random.integer(1, 30));

    commissions.push({
      id: `CM${String(i + 1).padStart(6, '0')}`,
      employeeId: employeeIds[Random.integer(0, employeeIds.length - 1)],
      serviceRecordId: `SR${String(i + 1).padStart(6, '0')}`,
      amount: Random.integer(30, 200),
      commissionDate: date.toISOString()
    });
  }
  return commissions;
};

export const mockWaitList = (customerIds: string[], serviceIds: string[]) => {
  const waitList = [];
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() + Random.integer(1, 7));
    const addedDate = new Date();
    addedDate.setDate(addedDate.getDate() - Random.integer(0, 3));

    waitList.push({
      id: `W${String(i + 1).padStart(6, '0')}`,
      customerId: customerIds[Random.integer(0, customerIds.length - 1)],
      serviceId: serviceIds[Random.integer(0, serviceIds.length - 1)],
      preferredDate: date.toISOString(),
      addedAt: addedDate.toISOString(),
      status: ['waiting', 'notified', 'cancelled', 'booked'][Random.integer(0, 3)]
    });
  }
  return waitList;
};
