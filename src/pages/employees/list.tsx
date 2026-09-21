import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Row,
  Col,
  Avatar,
  Rate,
  Descriptions,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  StarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { addEmployee, updateEmployee } from '../../store';
import type { Employee } from '../../types';
import { formatCurrency, generateId, getStatusText, formatDate, generateAvatar } from '../../utils/format';
import dayjs from 'dayjs';

const EmployeeList: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.app);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    form.setFieldsValue({
      role: 'beautician',
      status: 'active',
      baseSalary: 4000,
      commissionRate: 0.1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      baseSalary: employee.baseSalary,
      commissionRate: employee.commissionRate,
      skills: employee.skills,
      status: employee.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingEmployee) {
        dispatch(updateEmployee({ ...editingEmployee, ...values }));
        message.success('更新员工成功');
      } else {
        const newEmployee: Employee = {
          id: generateId(),
          ...values,
          avatar: generateAvatar(values.name),
          hireDate: new Date().toISOString().split('T')[0],
        };
        dispatch(addEmployee(newEmployee));
        message.success('添加员工成功');
      }
      setIsModalOpen(false);
    } catch {
      // validation error
    }
  };

  const getEmployeeStats = (employeeId: string) => {
    const records = state.serviceRecords.filter((r) => r.employeeId === employeeId);
    const totalRevenue = records.reduce((sum, r) => sum + r.price, 0);
    const totalCommission = state.commissions
      .filter((c) => c.employeeId === employeeId)
      .reduce((sum, c) => sum + c.amount, 0);
    const reviews = state.reviews.filter((r) => r.employeeId === employeeId);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      serviceCount: records.length,
      totalRevenue,
      totalCommission,
      avgRating,
      reviewCount: reviews.length,
    };
  };

  const columns = [
    {
      title: '员工',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Employee) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {getStatusText(record.role)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space size={4} wrap>
          {skills.map((skillId) => {
            const service = state.services.find((s) => s.id === skillId);
            return (
              <Tag key={skillId} color="blue">
                {service?.name || skillId}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: '入职时间',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'leave' ? 'orange' : 'red'}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Employee) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">员工管理</h1>
          <p className="page-header-subtitle">共 {state.employees.length} 位员工</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加员工
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="card-wrapper" style={{ padding: 0 }} bordered={false}>
            <Table
              columns={columns}
              dataSource={state.employees}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card className="card-wrapper" title="员工业绩统计" bordered={false}>
            {state.employees
              .filter((e) => e.role === 'beautician' || e.role === 'technician')
              .map((employee) => {
                const stats = getEmployeeStats(employee.id);
                return (
                  <div
                    key={employee.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f5f5f5',
                    }}
                  >
                    <Space>
                      <Avatar size={40} src={employee.avatar} icon={<UserOutlined />} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{employee.name}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          服务 {stats.serviceCount} 次 · 评价 {stats.reviewCount} 条
                        </div>
                      </div>
                    </Space>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#C9A86C', fontWeight: 600 }}>
                        {formatCurrency(stats.totalRevenue)}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        <Rate
                          disabled
                          allowHalf
                          value={stats.avgRating}
                          style={{ fontSize: 12 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="card-wrapper" title="客户评价" bordered={false}>
            {state.reviews.slice(0, 10).map((review) => {
              const employee = state.employees.find((e) => e.id === review.employeeId);
              const customer = state.customers.find((c) => c.id === review.customerId);
              return (
                <div
                  key={review.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f5f5f5',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Avatar size={28} src={customer?.avatar} icon={<UserOutlined />} />
                      <span style={{ fontSize: 13 }}>{customer?.name}</span>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>→</span>
                      <span style={{ fontSize: 13 }}>{employee?.name}</span>
                    </Space>
                    <Rate disabled allowHalf value={review.rating} style={{ fontSize: 12 }} />
                  </div>
                  <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                    {review.comment}
                  </div>
                  <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
                    {formatDate(review.reviewDate)}
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingEmployee ? '编辑员工' : '添加员工'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="职位"
                rules={[{ required: true, message: '请选择职位' }]}
              >
                <Select
                  options={[
                    { value: 'beautician', label: '美容师' },
                    { value: 'technician', label: '技师' },
                    { value: 'manager', label: '店长' },
                    { value: 'receptionist', label: '前台' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select
                  options={[
                    { value: 'active', label: '在职' },
                    { value: 'leave', label: '请假' },
                    { value: 'terminated', label: '离职' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="baseSalary"
                label="基本工资"
                rules={[{ required: true, message: '请输入基本工资' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={500} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commissionRate"
                label="提成比例"
                rules={[{ required: true, message: '请输入提成比例' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="skills" label="技能标签">
            <Select
              mode="multiple"
              placeholder="请选择擅长的项目"
              options={state.services.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeList;
