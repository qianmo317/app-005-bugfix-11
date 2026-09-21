import React, { useState } from 'react';
import {
  Tabs,
  Descriptions,
  Tag,
  Avatar,
  Card,
  List,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Modal,
  message,
  Rate,
  Row,
  Col,
  Progress
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ReactECharts from 'echarts-for-react';
import type { RootState } from '../../store';
import {
  addSkinAnalysis,
  addAllergy,
  updateAllergy,
  deleteAllergy
} from '../../store';
import type { SkinAnalysis, Allergy } from '../../types';
import { formatDate, formatCurrency, generateId, getStatusText } from '../../utils/format';
import dayjs from 'dayjs';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.app);
  const [skinAnalysisModal, setSkinAnalysisModal] = useState(false);
  const [allergyModal, setAllergyModal] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [skinForm] = Form.useForm();
  const [allergyForm] = Form.useForm();

  const customer = state.customers.find((c) => c.id === id);
  const membership = state.memberships.find((m) => m.customerId === id);
  const skinAnalyses = state.skinAnalyses
    .filter((s) => s.customerId === id)
    .sort((a, b) => new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime());
  const allergies = state.allergies.filter((a) => a.customerId === id);
  const serviceRecords = state.serviceRecords
    .filter((r) => r.customerId === id)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  const appointments = state.appointments
    .filter((a) => a.customerId === id)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  if (!customer) {
    return <div className="empty-state">顾客不存在</div>;
  }

  const consumptionCategories = serviceRecords.reduce((acc, record) => {
    const service = state.services.find((s) => s.id === record.serviceId);
    if (service) {
      acc[service.category] = (acc[service.category] || 0) + record.price;
    }
    return acc;
  }, {} as Record<string, number>);

  const consumptionChartOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#f0f0f0',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        data: Object.entries(consumptionCategories).map(([name, value]) => ({
          name,
          value,
        })),
        color: ['#E8C1BA', '#C9A86C', '#D4A0A0', '#F8B4B4', '#B8D4E3', '#A5D6A7'],
      },
    ],
  };

  const handleAddSkinAnalysis = async () => {
    try {
      const values = await skinForm.validateFields();
      const analysis: SkinAnalysis = {
        id: generateId(),
        customerId: id!,
        analysisDate: dayjs(values.analysisDate).format('YYYY-MM-DD'),
        skinType: values.skinType,
        oiliness: values.oiliness,
        moisture: values.moisture,
        elasticity: values.elasticity,
        sensitivity: values.sensitivity,
        skinCondition: values.skinCondition,
        recommendations: values.recommendations,
      };
      dispatch(addSkinAnalysis(analysis));
      message.success('添加皮肤分析成功');
      setSkinAnalysisModal(false);
      skinForm.resetFields();
    } catch {
      // validation error
    }
  };

  const handleAddAllergy = async () => {
    try {
      const values = await allergyForm.validateFields();
      if (editingAllergy) {
        dispatch(
          updateAllergy({
            ...editingAllergy,
            ...values,
            discoveredDate: values.discoveredDate
              ? dayjs(values.discoveredDate).format('YYYY-MM-DD')
              : editingAllergy.discoveredDate,
          })
        );
        message.success('更新过敏史成功');
      } else {
        const allergy: Allergy = {
          id: generateId(),
          customerId: id!,
          allergen: values.allergen,
          severity: values.severity,
          discoveredDate: values.discoveredDate
            ? dayjs(values.discoveredDate).format('YYYY-MM-DD')
            : new Date().toISOString().split('T')[0],
          notes: values.notes || '',
        };
        dispatch(addAllergy(allergy));
        message.success('添加过敏史成功');
      }
      setAllergyModal(false);
      setEditingAllergy(null);
      allergyForm.resetFields();
    } catch {
      // validation error
    }
  };

  const handleEditAllergy = (allergy: Allergy) => {
    setEditingAllergy(allergy);
    allergyForm.setFieldsValue({
      allergen: allergy.allergen,
      severity: allergy.severity,
      discoveredDate: dayjs(allergy.discoveredDate),
      notes: allergy.notes,
    });
    setAllergyModal(true);
  };

  const handleDeleteAllergy = (allergyId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该过敏记录吗？',
      onOk: () => {
        dispatch(deleteAllergy(allergyId));
        message.success('删除成功');
      },
    });
  };

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customers')}
          />
          <div>
            <h1 className="page-header-title" style={{ margin: 0 }}>
              顾客详情
            </h1>
            <p className="page-header-subtitle">顾客档案管理</p>
          </div>
        </Space>
      </div>

      <Card className="card-wrapper" style={{ marginBottom: 16 }}>
        <Space size={24} align="start">
          <Avatar size={80} src={customer.avatar} />
          <Descriptions column={3} style={{ flex: 1 }}>
            <Descriptions.Item label="姓名">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{customer.phone}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {customer.gender === 'female' ? '女' : '男'}
            </Descriptions.Item>
            <Descriptions.Item label="生日">{customer.birthday || '-'}</Descriptions.Item>
            <Descriptions.Item label="肤质">
              <Tag color="blue">{customer.skinType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="会员等级">
              {membership ? (
                <span className={`membership-badge ${membership.level}`}>
                  {getStatusText(membership.level)}
                </span>
              ) : (
                <Tag>普通</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="地址" span={3}>{customer.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{customer.notes || '-'}</Descriptions.Item>
          </Descriptions>
        </Space>
        {membership && (
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>累计消费</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#C9A86C' }}>
                  {formatCurrency(membership.totalSpent)}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>积分</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#C9A86C' }}>
                  {membership.points}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>升级进度</div>
                <Progress
                  percent={Math.min((membership.points % 1000) / 10, 100)}
                  strokeColor="#C9A86C"
                  size="small"
                />
              </div>
            </Col>
          </Row>
        )}
      </Card>

      <Tabs
        defaultActiveKey="skin"
        items={[
          {
            key: 'skin',
            label: '皮肤分析记录',
            children: (
              <Card
                className="card-wrapper"
                title="皮肤分析记录"
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setSkinAnalysisModal(true)}
                  >
                    添加记录
                  </Button>
                }
              >
                {skinAnalyses.length > 0 ? (
                  <List
                    dataSource={skinAnalyses}
                    renderItem={(item) => (
                      <List.Item key={item.id} style={{ padding: '16px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <List.Item.Meta
                          avatar={<ClockCircleOutlined style={{ fontSize: 24, color: '#C9A86C' }} />}
                          title={`${formatDate(item.analysisDate)} · ${item.skinType}`}
                          description={
                            <Space direction="vertical" size={4}>
                              <Space size={16}>
                                <span>油脂: {item.oiliness}</span>
                                <span>水分: {item.moisture}</span>
                                <span>弹性: {item.elasticity}</span>
                                <span>敏感: {item.sensitivity}</span>
                              </Space>
                              <span>状况: {item.skinCondition}</span>
                              <span>建议: {item.recommendations}</span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">暂无皮肤分析记录</div>
                )}
              </Card>
            ),
          },
          {
            key: 'allergy',
            label: '过敏史',
            children: (
              <Card
                className="card-wrapper"
                title="过敏史"
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingAllergy(null);
                      allergyForm.resetFields();
                      setAllergyModal(true);
                    }}
                  >
                    添加过敏史
                  </Button>
                }
              >
                {allergies.length > 0 ? (
                  <List
                    dataSource={allergies}
                    renderItem={(item) => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditAllergy(item)}
                          >
                            编辑
                          </Button>,
                          <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteAllergy(item.id)}
                          >
                            删除
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <span>{item.allergen}</span>
                              <Tag color={item.severity === 'severe' ? 'red' : item.severity === 'moderate' ? 'orange' : 'green'}>
                                {getStatusText(item.severity)}
                              </Tag>
                            </Space>
                          }
                          description={`发现日期: ${formatDate(item.discoveredDate)}${item.notes ? ` · ${item.notes}` : ''}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">暂无过敏记录</div>
                )}
              </Card>
            ),
          },
          {
            key: 'consumption',
            label: '消费分析',
            children: (
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Card className="card-wrapper" title="消费偏好分析">
                    <div className="chart-container">
                      <ReactECharts option={consumptionChartOption} style={{ height: '100%' }} />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card className="card-wrapper" title="消费统计">
                    <Descriptions column={1}>
                      <Descriptions.Item label="总消费次数">
                        {serviceRecords.length} 次
                      </Descriptions.Item>
                      <Descriptions.Item label="总消费金额">
                        {formatCurrency(membership?.totalSpent || 0)}
                      </Descriptions.Item>
                      <Descriptions.Item label="平均消费">
                        {formatCurrency(
                          serviceRecords.length > 0
                            ? (membership?.totalSpent || 0) / serviceRecords.length
                            : 0
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="最近消费">
                        {serviceRecords.length > 0
                          ? formatDate(serviceRecords[0].serviceDate)
                          : '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'history',
            label: '服务历史',
            children: (
              <Card className="card-wrapper" title="服务历史">
                {serviceRecords.length > 0 ? (
                  serviceRecords.map((record) => {
                    const service = state.services.find((s) => s.id === record.serviceId);
                    const employee = state.employees.find((e) => e.id === record.employeeId);
                    return (
                      <div key={record.id} className="timeline-item">
                        <div className="timeline-item-date">{formatDate(record.serviceDate)}</div>
                        <div className="timeline-item-content">
                          <Space>
                            <span style={{ fontWeight: 500 }}>{service?.name || '未知项目'}</span>
                            <Tag color="blue">{employee?.name || '未知'}</Tag>
                            <span style={{ color: '#C9A86C' }}>{formatCurrency(record.price)}</span>
                          </Space>
                          {record.notes && (
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                              {record.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">暂无服务记录</div>
                )}
              </Card>
            ),
          },
          {
            key: 'appointments',
            label: '预约记录',
            children: (
              <Card className="card-wrapper" title="预约记录">
                {appointments.length > 0 ? (
                  <List
                    dataSource={appointments}
                    renderItem={(item) => {
                      const service = state.services.find((s) => s.id === item.serviceId);
                      const employee = state.employees.find((e) => e.id === item.employeeId);
                      return (
                        <List.Item key={item.id}>
                          <List.Item.Meta
                            avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#C9A86C' }} />}
                            title={
                              <Space>
                                <span>{service?.name || '未知项目'}</span>
                                <Tag color={
                                  item.status === 'completed' ? 'green' :
                                  item.status === 'confirmed' ? 'blue' :
                                  item.status === 'pending' ? 'orange' :
                                  item.status === 'no_show' ? 'red' : 'default'
                                }>
                                  {getStatusText(item.status)}
                                </Tag>
                              </Space>
                            }
                            description={`${formatDate(item.startTime, 'YYYY-MM-DD HH:mm')} · ${employee?.name || '未知'}`}
                          />
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <div className="empty-state">暂无预约记录</div>
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title="添加皮肤分析记录"
        open={skinAnalysisModal}
        onOk={handleAddSkinAnalysis}
        onCancel={() => setSkinAnalysisModal(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form form={skinForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="analysisDate"
                label="分析日期"
                rules={[{ required: true, message: '请选择日期' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="skinType"
                label="肤质类型"
                rules={[{ required: true, message: '请选择肤质' }]}
                initialValue="中性"
              >
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
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="oiliness" label="油脂分泌" initialValue="正常">
                <Select
                  options={[
                    { value: '偏低', label: '偏低' },
                    { value: '正常', label: '正常' },
                    { value: '偏高', label: '偏高' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="moisture" label="水分含量" initialValue="正常">
                <Select
                  options={[
                    { value: '偏低', label: '偏低' },
                    { value: '正常', label: '正常' },
                    { value: '偏高', label: '偏高' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="elasticity" label="皮肤弹性" initialValue="良好">
                <Select
                  options={[
                    { value: '良好', label: '良好' },
                    { value: '一般', label: '一般' },
                    { value: '需改善', label: '需改善' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sensitivity" label="敏感度" initialValue="无">
                <Select
                  options={[
                    { value: '无', label: '无' },
                    { value: '轻微', label: '轻微' },
                    { value: '明显', label: '明显' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="skinCondition" label="整体状况" initialValue="良好">
                <Select
                  options={[
                    { value: '良好', label: '良好' },
                    { value: '一般', label: '一般' },
                    { value: '需改善', label: '需改善' },
                    { value: '较差', label: '较差' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="recommendations" label="建议">
            <Input.TextArea rows={3} placeholder="请输入护理建议" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingAllergy ? '编辑过敏史' : '添加过敏史'}
        open={allergyModal}
        onOk={handleAddAllergy}
        onCancel={() => {
          setAllergyModal(false);
          setEditingAllergy(null);
        }}
        okText="确认"
        cancelText="取消"
        width={500}
      >
        <Form form={allergyForm} layout="vertical">
          <Form.Item
            name="allergen"
            label="过敏源"
            rules={[{ required: true, message: '请输入过敏源' }]}
          >
            <Input placeholder="请输入过敏源" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
                initialValue="mild"
              >
                <Select
                  options={[
                    { value: 'mild', label: '轻度' },
                    { value: 'moderate', label: '中度' },
                    { value: 'severe', label: '重度' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discoveredDate" label="发现日期" initialValue={dayjs()}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
