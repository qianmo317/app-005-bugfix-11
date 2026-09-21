import React, { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Avatar,
  message
} from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { addCustomer, deleteCustomer } from '../../store';
import type { Customer } from '../../types';
import { formatDate, getStatusText, generateId, generateAvatar } from '../../utils/format';
import dayjs from 'dayjs';

const CustomerList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((state: RootState) => state.app);
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const filteredCustomers = state.customers.filter(
    (c) => {
      if (!c.name.includes(searchText) && !c.phone.includes(searchText)) return false;
      if (levelFilter) {
        const membership = state.memberships.find((m) => m.customerId === c.id);
        if (membership?.level !== levelFilter) return false;
      }
      return true;
    }
  );

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newCustomer: Customer = {
        id: generateId(),
        name: values.name,
        phone: values.phone,
        birthday: values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : '',
        gender: values.gender,
        avatar: generateAvatar(values.name),
        address: values.address || '',
        skinType: values.skinType || '中性',
        notes: values.notes || '',
        createdAt: new Date().toISOString(),
      };
      dispatch(addCustomer(newCustomer));
      message.success('添加顾客成功');
      setIsModalOpen(false);
    } catch {
      // validation error
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后该顾客的会员卡、过敏史、皮肤分析、预约、服务与评价等全部记录将一并删除，且无法恢复。确定要删除吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteCustomer(id));
        message.success('删除成功');
      },
    });
  };

  const columns = [
    {
      title: '顾客',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Customer) => (
        <Space>
          <Avatar src={record.avatar} />
          <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/customers/${record.id}`)}>
            {record.name}
          </span>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '肤质',
      dataIndex: 'skinType',
      key: 'skinType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '会员等级',
      key: 'membership',
      render: (_: unknown, record: Customer) => {
        const membership = state.memberships.find((m) => m.customerId === record.id);
        if (!membership) return <Tag>普通</Tag>;
        return (
          <span className={`membership-badge ${membership.level}`}>
            {getStatusText(membership.level)}
          </span>
        );
      },
    },
    {
      title: '累计消费',
      key: 'totalSpent',
      render: (_: unknown, record: Customer) => {
        const membership = state.memberships.find((m) => m.customerId === record.id);
        return membership ? `¥${membership.totalSpent.toLocaleString()}` : '¥0';
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/customers/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">顾客管理</h1>
          <p className="page-header-subtitle">共 {state.customers.length} 位顾客</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加顾客
        </Button>
      </div>

      <div className="search-bar">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Input
              placeholder="搜索顾客姓名或手机号"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="会员等级"
              style={{ width: '100%' }}
              allowClear
              value={levelFilter}
              onChange={(value) => setLevelFilter(value)}
              options={[
                { value: 'bronze', label: '青铜' },
                { value: 'silver', label: '白银' },
                { value: 'gold', label: '黄金' },
                { value: 'platinum', label: '铂金' },
                { value: 'diamond', label: '钻石' },
              ]}
            />
          </Col>
        </Row>
      </div>

      <div className="card-wrapper" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </div>

      <Modal
        title="添加顾客"
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
              <Form.Item name="birthday" label="生日">
                <DatePicker style={{ width: '100%' }} placeholder="请选择生日" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="性别"
                initialValue="female"
              >
                <Select
                  options={[
                    { value: 'female', label: '女' },
                    { value: 'male', label: '男' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="skinType" label="肤质" initialValue="中性">
                <Select
                  options={[
                    { value: '干性', label: '干性' },
                    { value: '油性', label: '油性' },
                    { value: '混合性', label: '混合性' },
                    { value: '中性', label: '中性' },
                    { value: '敏感肌', label: '敏感肌' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="地址">
                <Input placeholder="请输入地址" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerList;
