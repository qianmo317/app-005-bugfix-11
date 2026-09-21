import type { Membership, ServiceRecord } from '../types';

/**
 * 会员等级阈值，全站统一：
 * 累计消费 >5000 白银，>10000 黄金，>20000 铂金，>30000 钻石，其余青铜
 */
export const getMembershipLevel = (totalSpent: number): Membership['level'] => {
  if (totalSpent > 30000) return 'diamond';
  if (totalSpent > 20000) return 'platinum';
  if (totalSpent > 10000) return 'gold';
  if (totalSpent > 5000) return 'silver';
  return 'bronze';
};

/**
 * 以服务记录为唯一事实来源，重算会员卡的累计消费、积分与等级，
 * 保证顾客列表、详情页、仪表板看到的是同一套数字。
 */
export const syncMembershipFromRecords = (
  membership: Membership,
  records: ServiceRecord[]
): Membership => {
  const totalSpent = records
    .filter((r) => r.customerId === membership.customerId)
    .reduce((sum, r) => sum + r.price, 0);
  return {
    ...membership,
    totalSpent,
    points: Math.floor(totalSpent / 10),
    level: getMembershipLevel(totalSpent),
  };
};
