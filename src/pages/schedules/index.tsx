import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Select,
  Modal,
  message,
  Tooltip,
  Avatar,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { updateSchedule } from '../../store';
import type { Schedule } from '../../types';
import { formatDate, getStatusText, getStatusColor, getShiftColor, generateId } from '../../utils/format';
import dayjs from 'dayjs';

const EmployeeSchedule: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.app);
  const [weekOffset, setWeekOffset] = useState(0);

  const activeEmployees = state.employees.filter(
    (e) => e.status === 'active' && (e.role === 'beautician' || e.role === 'technician')
  );

  const startOfWeek = dayjs().startOf('week').add(weekOffset, 'week');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const getScheduleForEmployeeAndDate = (employeeId: string, date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return state.schedules.find((s) => s.employeeId === employeeId && s.date === dateStr);
  };

  const handleShiftChange = (employeeId: string, date: dayjs.Dayjs, shiftType: string) => {
    const dateStr = date.format('YYYY-MM-DD');
    const existing = getScheduleForEmployeeAndDate(employeeId, date);

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
    } else if (shiftType === 'overtime') {
      startTime = '18:00';
      endTime = '22:00';
    }

    const schedule: Schedule = {
      id: existing?.id || generateId(),
      employeeId,
      date: dateStr,
      shiftType: shiftType as Schedule['shiftType'],
      startTime,
      endTime,
    };

    dispatch(updateSchedule(schedule));
    message.success('排班更新成功');
  };

  const shiftOptions = [
    { value: 'morning', label: '早班' },
    { value: 'afternoon', label: '晚班' },
    { value: 'full_day', label: '全天' },
    { value: 'off', label: '休息' },
    { value: 'overtime', label: '加班' },
  ];

  const shiftMenu = (employeeId: string, date: dayjs.Dayjs) => ({
    items: shiftOptions.map((opt) => ({
      key: opt.value,
      label: opt.label,
      onClick: () => handleShiftChange(employeeId, date, opt.value),
    })),
  });

  const columns = [
    {
      title: '美容师',
      dataIndex: 'employee',
      key: 'employee',
      fixed: 'left' as const,
      width: 120,
      render: (_: unknown, record: { employee: typeof state.employees[0] }) => (
        <Space>
          <Avatar size={32} src={record.employee.avatar} icon={<UserOutlined />} />
          <span>{record.employee.name}</span>
        </Space>
      ),
    },
    ...weekDays.map((day) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>{day.format('MM/DD')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>
            {day.format('ddd')}
          </div>
        </div>
      ),
      dataIndex: day.format('YYYY-MM-DD'),
      key: day.format('YYYY-MM-DD'),
      width: 100,
      render: (_: unknown, record: { employee: typeof state.employees[0] }) => {
        const schedule = getScheduleForEmployeeAndDate(record.employee.id, day);
        const shiftType = schedule?.shiftType || (day.day() === 1 ? 'off' : 'full_day');
        return (
          <Tooltip title="点击更改班次">
            <Dropdown
              menu={shiftMenu(record.employee.id, day)}
              trigger={['click']}
            >
              <div
                className={`schedule-cell ${shiftType}`}
                style={{ background: getShiftColor(shiftType) + '30' }}
              >
                <div style={{ fontWeight: 500 }}>{getStatusText(shiftType)}</div>
                {schedule && (
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>
                    {schedule.startTime !== '--' ? `${schedule.startTime}-${schedule.endTime}` : ''}
                  </div>
                )}
              </div>
            </Dropdown>
          </Tooltip>
        );
      },
    })),
  ];

  const tableData = activeEmployees.map((employee) => ({
    key: employee.id,
    employee,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">员工排班</h1>
          <p className="page-header-subtitle">
            {weekDays[0].format('YYYY/MM/DD')} - {weekDays[6].format('YYYY/MM/DD')} 排班表
          </p>
        </div>
        <Space>
          <Button onClick={() => setWeekOffset(weekOffset - 1)}>上一周</Button>
          <Button onClick={() => setWeekOffset(0)}>本周</Button>
          <Button onClick={() => setWeekOffset(weekOffset + 1)}>下一周</Button>
        </Space>
      </div>

      <Card className="card-wrapper" bordered={false} style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card className="card-wrapper" title="班次说明" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {[
                { type: 'morning', label: '早班', time: '09:00 - 14:00' },
                { type: 'afternoon', label: '晚班', time: '14:00 - 21:00' },
                { type: 'full_day', label: '全天', time: '09:00 - 21:00' },
                { type: 'off', label: '休息', time: '' },
                { type: 'overtime', label: '加班', time: '18:00 - 22:00' },
              ].map((shift) => (
                <div key={shift.type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 30,
                      borderRadius: 6,
                      background: getShiftColor(shift.type) + '30',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                    }}
                  >
                    {shift.label}
                  </div>
                  <span style={{ color: '#8c8c8c' }}>{shift.time}</span>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="card-wrapper" title="今日考勤" bordered={false}>
            {activeEmployees.map((employee) => {
              const todayAttendance = state.attendance.find(
                (a) => a.employeeId === employee.id && a.date === dayjs().format('YYYY-MM-DD')
              );
              return (
                <div
                  key={employee.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f5f5f5',
                  }}
                >
                  <Space>
                    <Avatar size={32} src={employee.avatar} icon={<UserOutlined />} />
                    <span>{employee.name}</span>
                  </Space>
                  {todayAttendance ? (
                    <Space>
                      <Tag color={getStatusColor(todayAttendance.status)}>
                        {getStatusText(todayAttendance.status)}
                      </Tag>
                      {todayAttendance.checkIn !== '--' && (
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {todayAttendance.checkIn}
                        </span>
                      )}
                    </Space>
                  ) : (
                    <Tag color="default">未打卡</Tag>
                  )}
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeSchedule;
