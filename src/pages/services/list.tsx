import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { addService, deleteService, updateService } from '../../store';
import type { Service } from '../../types';
import { formatCurrency, generateId } from '../../utils/format';

const ServiceList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((state: RootState) => state.app);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  const categories = [...new Set(state.services.map((s) => s.category))];

  const filteredServices = state.services.filter(
    (s) =>
      (!searchText || s.name.includes(searchText)) &&
      (!categoryFilter || s.category === categoryFilter)
  );

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({
      duration: 60,
      price: 200,
      suitableSkin: ['中性'],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      description: service.description,
      suitableSkin: service.suitableSkin,
      effectDescription: service.effectDescription,
      status: service.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingService) {
        dispatch(
          updateService({
            ...editingService,
            ...values,
          })
        );
        message.success('更新项目成功');
      } else {
        const newService: Service = {
          id: `S${String(state.services.length + 1).padStart(3, '0')}`,
          ...values,
          imageUrl: '',
        };
        dispatch(addService(newService));
        message.success('添加项目成功');
      }
      setIsModalOpen(false);
    } catch {
      // validation error
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该项目吗？',
      onOk: () => {
        dispatch(deleteService(id));
        message.success('删除成功');
      },
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      面部护理: 'magenta',
      眼部护理: 'purple',
      身体护理: 'cyan',
      头发护理: 'geekblue',
      美甲: 'pink',
      脱毛: 'orange',
    };
    return colors[category] || 'blue';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">项目管理</h1>
          <p className="page-header-subtitle">共 {state.services.length} 个项目</p>
        </div>
        <Space>
          <Button onClick={() => navigate('/packages')}>套餐管理</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加项目
          </Button>
        </Space>
      </div>

      <div className="search-bar">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Input
              placeholder="搜索项目名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="分类"
              style={{ width: '100%' }}
              allowClear
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="适用肤质"
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: '干性', label: '干性' },
                { value: '油性', label: '油性' },
                { value: '混合性', label: '混合性' },
                { value: '中性', label: '中性' },
                { value: '敏感肌', label: '敏感肌' },
              ]}
            />
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        {filteredServices.map((service) => (
          <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
            <Card
              hoverable
              className="service-card"
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 16 }}
              actions={[
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(service)}
                >
                  编辑
                </Button>,
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(service.id)}
                >
                  删除
                </Button>,
              ]}
            >
              <div
                style={{
                  height: 120,
                  background: `linear-gradient(135deg, #E8C1BA 0%, #D4A0A0 100%)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  fontSize: 32,
                  color: '#fff',
                }}
              >
                {service.name.charAt(0)}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                {service.name}
              </div>
              <Space size={4} wrap style={{ marginBottom: 8 }}>
                <Tag color={getCategoryColor(service.category)}>{service.category}</Tag>
                {service.suitableSkin.map((skin) => (
                  <Tag key={skin} color="blue">
                    {skin}
                  </Tag>
                ))}
              </Space>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>{service.duration}分钟</span>
                </Space>
                <span style={{ color: '#C9A86C', fontWeight: 600, fontSize: 18 }}>
                  {formatCurrency(service.price)}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
                {service.description}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingService ? '编辑项目' : '添加项目'}
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
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select
                  placeholder="请选择分类"
                  options={categories.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="时长(分钟)"
                rules={[{ required: true, message: '请输入时长' }]}
              >
                <InputNumber style={{ width: '100%' }} min={15} step={15} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="价格(元)"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={10} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="suitableSkin"
            label="适用肤质"
            rules={[{ required: true, message: '请选择适用肤质' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择适用肤质"
              options={[
                { value: '干性', label: '干性' },
                { value: '油性', label: '油性' },
                { value: '混合性', label: '混合性' },
                { value: '中性', label: '中性' },
                { value: '敏感肌', label: '敏感肌' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item name="effectDescription" label="效果描述">
            <Input.TextArea rows={2} placeholder="请输入效果描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceList;
