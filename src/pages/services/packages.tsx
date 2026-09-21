import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { addPackage, updatePackage } from '../../store';
import type { Package } from '../../types';
import { formatCurrency, generateId } from '../../utils/format';

const PackageList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.app);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingPackage(null);
    form.resetFields();
    form.setFieldsValue({
      validityDays: 90,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    form.setFieldsValue({
      name: pkg.name,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      validityDays: pkg.validityDays,
      description: pkg.description,
      status: pkg.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingPackage) {
        dispatch(updatePackage({ ...editingPackage, ...values }));
        message.success('更新套餐成功');
      } else {
        const newPackage: Package = {
          id: `P${String(state.packages.length + 1).padStart(3, '0')}`,
          ...values,
          imageUrl: '',
        };
        dispatch(addPackage(newPackage));
        message.success('添加套餐成功');
      }
      setIsModalOpen(false);
    } catch {
      // validation error
    }
  };

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/services')}
          />
          <div>
            <h1 className="page-header-title" style={{ margin: 0 }}>
              套餐管理
            </h1>
            <p className="page-header-subtitle">共 {state.packages.length} 个套餐</p>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加套餐
        </Button>
      </div>

      {state.packages.length > 0 ? (
        <Row gutter={[16, 16]}>
          {state.packages.map((pkg) => {
            const packageItems = state.packageItems.filter((pi) => pi.packageId === pkg.id);
            return (
              <Col xs={24} sm={12} md={8} key={pkg.id}>
                <Card
                  style={{ borderRadius: 12 }}
                  bodyStyle={{ padding: 20 }}
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(pkg)}
                    >
                      编辑
                    </Button>,
                  ]}
                >
                  <div
                    style={{
                      height: 100,
                      background: 'linear-gradient(135deg, #C9A86C 0%, #B8956A 100%)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      color: '#fff',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>{pkg.name}</div>
                      <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>
                        {formatCurrency(pkg.price)}
                      </div>
                      <div style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.7 }}>
                        {formatCurrency(pkg.originalPrice)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>
                    有效期: {pkg.validityDays}天
                  </div>
                  <div style={{ fontSize: 13, color: '#3A3A3A' }}>{pkg.description}</div>
                  {packageItems.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f5f5f5' }}>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>包含项目:</div>
                      <Space size={4} wrap>
                        {packageItems.map((item) => {
                          const service = state.services.find((s) => s.id === item.serviceId);
                          return (
                            <Tag key={item.id} color="gold">
                              {service?.name} x{item.count}
                            </Tag>
                          );
                        })}
                      </Space>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description="暂无套餐" />
      )}

      <Modal
        title={editingPackage ? '编辑套餐' : '添加套餐'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="确认"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="套餐名称"
            rules={[{ required: true, message: '请输入套餐名称' }]}
          >
            <Input placeholder="请输入套餐名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="套餐价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="originalPrice"
                label="原价"
                rules={[{ required: true, message: '请输入原价' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={100} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="validityDays"
            label="有效期(天)"
            rules={[{ required: true, message: '请输入有效期' }]}
          >
            <InputNumber style={{ width: '100%' }} min={30} step={30} />
          </Form.Item>
          <Form.Item name="description" label="套餐描述">
            <Input.TextArea rows={3} placeholder="请输入套餐描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PackageList;
