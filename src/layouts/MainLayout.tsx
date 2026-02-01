import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Drawer } from 'antd';
import { useMobile } from '../hooks/useMobile';
import { 
  DashboardOutlined, 
  TransactionOutlined, 
  WalletOutlined, 
  BankOutlined,
  LogoutOutlined,
  PieChartOutlined,
  FlagOutlined,
  TagOutlined,
  SettingOutlined,
  CalendarOutlined,
  MenuOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMobile();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const menuItems = [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/transactions', icon: <TransactionOutlined />, label: 'Transactions' },
        { key: '/categories', icon: <TagOutlined />, label: 'Categories' },
        { key: '/budgets', icon: <PieChartOutlined />, label: 'Budgets' },
        { key: '/planned-expenses', icon: <CalendarOutlined />, label: 'Planned Expenses' },
        { key: '/goals', icon: <FlagOutlined />, label: 'Goals' },
        { key: '/accounts', icon: <BankOutlined />, label: 'Accounts' },
        { key: '/debts', icon: <WalletOutlined />, label: 'Debts' },
        { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
        if (isMobile) setDrawerOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        if (isMobile) setDrawerOpen(false);
    };

    const menuContent = (
        <>
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>Finku</Title>
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ borderRight: 0 }}
            />
            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <Button block icon={<LogoutOutlined />} onClick={handleLogout} danger>
                    Logout
                </Button>
            </div>
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isMobile && (
                <Sider theme="light" width={220}>
                    {menuContent}
                </Sider>
            )}
            <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Header style={{ 
                    padding: isMobile ? '0 16px' : '0 24px', 
                    background: '#fff', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                    boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {isMobile && (
                        <>
                            <Button 
                                type="text" 
                                icon={<MenuOutlined />} 
                                onClick={() => setDrawerOpen(true)}
                                style={{ fontSize: 20, marginRight: 8 }}
                            />
                            <Title level={4} style={{ margin: 0, color: '#1890ff', flex: 1 }}>Finku</Title>
                        </>
                    )}
                    {!isMobile && (
                        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 280, pointerEvents: 'none' }}>
                            <svg width="100%" height="100%" viewBox="0 0 280 64" fill="none" preserveAspectRatio="xMaxYMid slice" style={{ opacity: 0.15 }}>
                                <defs>
                                    <pattern id="header-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <circle cx="20" cy="20" r="2" fill="#1890ff" />
                                        <circle cx="0" cy="0" r="1.5" fill="#1890ff" />
                                        <circle cx="40" cy="40" r="1" fill="#1890ff" />
                                    </pattern>
                                    <linearGradient id="header-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#1890ff" stopOpacity="0" />
                                        <stop offset="100%" stopColor="#1890ff" stopOpacity="0.08" />
                                    </linearGradient>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#header-pattern)" />
                                <rect width="100%" height="100%" fill="url(#header-grad)" />
                                <circle cx="240" cy="32" r="24" stroke="#1890ff" strokeWidth="1" fill="none" opacity="0.2" />
                                <circle cx="260" cy="20" r="12" stroke="#1890ff" strokeWidth="0.8" fill="none" opacity="0.15" />
                                <circle cx="255" cy="48" r="8" stroke="#1890ff" strokeWidth="0.6" fill="none" opacity="0.1" />
                            </svg>
                        </div>
                    )}
                </Header>
                <Content style={{ 
                    flex: 1,
                    margin: isMobile ? '12px' : '16px', 
                    padding: isMobile ? 12 : 24, 
                    background: '#fff', 
                    borderRadius: 8,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    minHeight: 0
                }}>
                    <Outlet />
                </Content>
            </Layout>
            {isMobile && (
            <Drawer
                title="Menu"
                placement="left"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={280}
                styles={{ body: { padding: 0 } }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 80 }}>
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={handleMenuClick}
                        style={{ borderRight: 0, flex: 1 }}
                    />
                    <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
                        <Button block icon={<LogoutOutlined />} onClick={handleLogout} danger>
                            Logout
                        </Button>
                    </div>
                </div>
            </Drawer>
            )}
        </Layout>
    );
};

export default MainLayout;
