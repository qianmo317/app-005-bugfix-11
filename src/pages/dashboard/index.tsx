import React from 'react';
import { Row, Col, Card, List, Avatar, Tag, Progress, Space } from 'antd';
import {
  DollarOutlined,
  UserAddOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatCurrency, formatTime, getStatusColor } from '../../utils/format';

const Dashboard: React.FC = () => {
  const state = useSelector((state: RootState) => state.app);

  const today = new Date().toISOString().split('T')[0];

  const completedRecords = state.serviceRecords.filter(
    (r) => r.serviceDate.split('T')[0] === today
  );
  const monthlyRevenue = state.serviceRecords
    .filter((r) => {
      const recordDate = new Date(r.serviceDate);
      const now = new Date();
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, r) => sum + r.price, 0);

  const newCustomers = state.customers.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const todayAppointments = state.appointments
    .filter((a) => a.startTime.split('T')[0] === today)
    .slice(0, 5);

  const todayAppointmentList = todayAppointments.map((a) => {
    const customer = state.customers.find((c) => c.id === a.customerId);
    const service = state.services.find((s) => s.id === a.serviceId);
    const employee = state.employees.find((e) => e.id === a.employeeId);
    return {
      id: a.id,
      customerName: customer?.name || '',
      customerAvatar: customer?.avatar || '',
      serviceName: service?.name || '',
      employeeName: employee?.name || '',
      time: formatTime(a.startTime),
      status: a.status,
    };
  });

  const employeeStats = state.employees
    .filter((e) => e.role === 'beautician' || e.role === 'technician')
    .map((e) => {
      const records = state.serviceRecords.filter((r) => r.employeeId === e.id);
      const revenue = records.reduce((sum, r) => sum + r.price, 0);
      return { name: e.name, value: revenue };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const revenueTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayRevenue = state.serviceRecords
      .filter((r) => r.serviceDate.split('T')[0] === dateStr)
      .reduce((sum, r) => sum + r.price, 0);
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: dayRevenue,
    };
  });

  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#f0f0f0',
      textStyle: { color: '#3A3A3A' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: revenueTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: {
        color: '#8c8c8c',
        formatter: (value: number) => `¥${value / 1000}k`,
      },
    },
    series: [
      {
        data: revenueTrendData.map((d) => d.value),
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#C9A86C',
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(201, 168, 108, 0.3)' },
              { offset: 1, color: 'rgba(201, 168, 108, 0.02)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#C9A86C' },
      },
    ],
  };

  const rankingChartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#f0f0f0',
      textStyle: { color: '#3A3A3A' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: employeeStats.map((e) => e.name),
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: {
        color: '#8c8c8c',
        formatter: (value: number) => `¥${value / 1000}k`,
      },
    },
    series: [
      {
        data: employeeStats.map((e) => e.value),
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#E8C1BA' },
              { offset: 1, color: '#D4A0A0' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const statCards = [
    {
      title: '本月营业额',
      value: formatCurrency(monthlyRevenue),
      icon: <DollarOutlined />,
      trend: '+12.5%',
      trendUp: true,
      gradient: true,
    },
    {
      title: '新增顾客',
      value: newCustomers,
      icon: <UserAddOutlined />,
      trend: '+8',
      trendUp: true,
    },
    {
      title: '预约数量',
      value: todayAppointments.length,
      icon: <CalendarOutlined />,
      trend: '今日',
      trendUp: true,
    },
    {
      title: '服务完成',
      value: completedRecords.length,
      icon: <CheckCircleOutlined />,
      trend: '今日',
      trendUp: true,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">仪表板</h1>
          <p className="page-header-subtitle">欢迎使用雅尚美容院管理系统</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className={`stat-card ${card.gradient ? 'grad-card' : ''}`} bordered={false}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-card-title">{card.title}</div>
                  <div className="stat-card-value">{card.value}</div>
                  <div className={`stat-card-trend ${card.trendUp ? 'up' : 'down'}`}>
                    {card.trendUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {card.trend}
                  </div>
                </div>
                <div style={{
                  fontSize: 28,
                  opacity: 0.8,
                  ...(card.gradient ? { color: '#fff' } : { color: '#C9A86C' })
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card className="card-wrapper" title="营业趋势" bordered={false}>
            <div className="chart-container">
              <ReactECharts option={trendChartOption} style={{ height: '100%' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="card-wrapper" title="今日预约" bordered={false}>
            {todayAppointmentList.length > 0 ? (
              <List
                dataSource={todayAppointmentList}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    style={{ padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.customerAvatar} />}
                      title={
                        <Space>
                          <span>{item.customerName}</span>
                          <Tag color={getStatusColor(item.status)}>
                            {item.status === 'confirmed' ? '已确认' : item.status === 'completed' ? '已完成' : item.status === 'pending' ? '待确认' : item.status === 'cancelled' ? '已取消' : '爽约'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {item.serviceName} · {item.employeeName}
                          </div>
                          <div style={{ fontSize: 12, color: '#C9A86C', fontWeight: 500 }}>
                            {item.time}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="empty-state">今日暂无预约</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card className="card-wrapper" title="员工业绩排行" bordered={false}>
            <div className="chart-container">
              <ReactECharts option={rankingChartOption} style={{ height: '100%' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="card-wrapper" title="会员卡分布" bordered={false}>
            {(() => {
              const levels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
              const levelNames: Record<string, string> = {
                bronze: '青铜',
                silver: '白银',
                gold: '黄金',
                platinum: '铂金',
                diamond: '钻石',
              };
              return levels.map((level) => {
                const count = state.memberships.filter((m) => m.level === level).length;
                const percent = (count / state.memberships.length) * 100;
                return (
                  <div key={level} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{levelNames[level]}</span>
                      <span style={{ color: '#8c8c8c' }}>{count} 人</span>
                    </div>
                    <Progress
                      percent={Math.round(percent)}
                      showInfo={false}
                      strokeColor={
                        level === 'diamond'
                          ? '#70d1f4'
                          : level === 'platinum'
                          ? '#c0c0c0'
                          : level === 'gold'
                          ? '#ffd700'
                          : level === 'silver'
                          ? '#a8a8a8'
                          : '#cd7f32'
                      }
                    />
                  </div>
                );
              });
            })()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
