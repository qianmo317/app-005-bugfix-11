export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const encodeBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const generateAvatar = (name: string): string => {
  const colors = ['#E8C1BA', '#D4A0A0', '#F8B4B4', '#C9A86C', '#B8D4E3', '#A5D6A7', '#CE93D8', '#FFAB91'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const initial = name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="${color}"/>
      <text x="32" y="38" font-size="24" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-weight="bold">${initial}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${encodeBase64(svg)}`;
};

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'default',
    no_show: 'red',
    active: 'green',
    inactive: 'default',
    leave: 'orange',
    terminated: 'red',
    present: 'green',
    absent: 'red',
    late: 'orange',
    waiting: 'orange',
    notified: 'blue',
    booked: 'green',
    mild: 'green',
    moderate: 'orange',
    severe: 'red'
  };
  return colors[status] || 'default';
};

export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    no_show: '爽约',
    active: '在职',
    inactive: '停用',
    leave: '请假',
    terminated: '离职',
    present: '出勤',
    absent: '缺勤',
    late: '迟到',
    waiting: '等待中',
    notified: '已通知',
    booked: '已预约',
    mild: '轻度',
    moderate: '中度',
    severe: '重度',
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    platinum: '铂金',
    diamond: '钻石',
    beautician: '美容师',
    manager: '店长',
    receptionist: '前台',
    technician: '技师',
    morning: '早班',
    afternoon: '晚班',
    full_day: '全天',
    off: '休息',
    overtime: '加班',
    phone: '电话',
    wechat: '微信',
    walk_in: '到店',
    online: '线上'
  };
  return texts[status] || status;
};

export const getShiftColor = (shift: string): string => {
  const colors: Record<string, string> = {
    morning: '#69b1ff',
    afternoon: '#95de64',
    full_day: '#ffa940',
    off: '#d9d9d9',
    overtime: '#ff7875'
  };
  return colors[shift] || '#d9d9d9';
};
