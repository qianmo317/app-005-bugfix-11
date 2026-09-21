import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/customers',
      icon: <TeamOutlined />,
      label: '顾客管理',
    },
    {
      key: '/services',
      icon: <AppstoreOutlined />,
      label: '项目管理',
    },
    {
      key: '/appointments',
      icon: <CalendarOutlined />,
      label: '预约排期',
    },
    {
      key: '/schedules',
      icon: <ScheduleOutlined />,
      label: '员工排班',
    },
    {
      key: '/employees',
      icon: <UserOutlined />,
      label: '员工管理',
    },
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '系统设置',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
  };

  return (
    <Layout className="app-container">
      <Header className="app-header">
        <div className="app-logo">
          <span>✦</span>
          <span>雅尚美容院管理系统</span>
        </div>
        <Space size="large">
          <BellOutlined style={{ fontSize: 18, color: '#fff', cursor: 'pointer' }} />
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{ backgroundColor: '#fff', color: '#C9A86C' }}
                icon={<UserOutlined />}
              />
              <span style={{ color: '#fff' }}>管理员</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>
      <Layout style={{ background: '#FAFAFA' }}>
        <Sider width={220} theme="light" className="app-sidebar">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderInlineEnd: 'none' }}
          />
        </Sider>
        <Content className="app-main">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
