import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Row, Col, Card, Space } from 'antd';
import { 
  RocketOutlined, 
  PieChartOutlined, 
  SafetyCertificateOutlined, 
  LoginOutlined,
  UserAddOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const features = [
    {
      icon: <PieChartOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: 'Smart Budgeting',
      description: 'Track your expenses and income with intuitive charts and detailed reports.'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'Financial Goals',
      description: 'Set and achieve your financial targets with our goal tracking system.'
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely. Privacy first.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: '20px 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>F</div>
          <Title level={4} style={{ margin: 0, color: '#0050b3' }}>Finku</Title>
        </div>
        <Space>
          {token ? (
            <Button 
              type="primary" 
              icon={<ArrowRightOutlined />} 
              onClick={() => navigate('/dashboard')}
              shape="round"
              size="large"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/login')}>Login</Button>
              <Button type="primary" onClick={() => navigate('/register')} shape="round">Get Started</Button>
            </>
          )}
        </Space>
      </motion.div>

      {/* Hero Section */}
      <div style={{ 
        paddingTop: '120px', 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #f6ffed 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '-10%', 
          right: '-5%', 
          width: '50%', 
          height: '80%', 
          background: 'radial-gradient(circle, rgba(24,144,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', width: '100%', zIndex: 1, paddingTop: '100px', paddingBottom: '100px' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <Text strong style={{ color: '#1890ff', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Personal Finance Manager
                  </Text>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Title style={{ fontSize: '56px', marginTop: '16px', marginBottom: '24px', lineHeight: 1.2 }}>
                    Master Your Money, <br />
                    <span style={{ color: '#1890ff' }}>Build Your Future</span>
                  </Title>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '32px', maxWidth: '480px' }}>
                    Finku helps you track expenses, budget effectively, and reach your financial goals with ease. Simple, secure, and smart.
                  </Paragraph>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Space size="large">
                    <Button 
                      type="primary" 
                      size="large" 
                      shape="round" 
                      icon={token ? <ArrowRightOutlined /> : <UserAddOutlined />}
                      style={{ height: '56px', padding: '0 40px', fontSize: '18px' }}
                      onClick={() => navigate(token ? '/dashboard' : '/register')}
                    >
                      {token ? 'Go to Dashboard' : 'Start for Free'}
                    </Button>
                    {!token && (
                      <Button 
                        size="large" 
                        type="default" 
                        shape="round" 
                        icon={<LoginOutlined />}
                        style={{ height: '56px', padding: '0 32px', fontSize: '18px' }}
                        onClick={() => navigate('/login')}
                      >
                        Login
                      </Button>
                    )}
                  </Space>
                </motion.div>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ position: 'relative' }}
              >
                 {/* Abstract UI representation */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '24px', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                  padding: '32px',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                      <div style={{ width: '120px', height: '12px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ width: '80px', height: '8px', background: '#f5f5f5', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '40px', height: '40px', background: '#f0f5ff', borderRadius: '50%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: '100px', background: i === 1 ? '#1890ff' : '#f7f7f7', borderRadius: '16px', opacity: i === 1 ? 1 : 0.5 }} />
                    ))}
                  </div>
                  <div style={{ height: '200px', background: '#fafafa', borderRadius: '16px' }} />
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    background: 'white',
                    padding: '16px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RocketOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block' }}>Goal Reached!</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>You saved $500</Text>
                  </div>
                </motion.div>

              </motion.div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <Title level={2}>Why Choose Finku?</Title>
            <Text type="secondary" style={{ fontSize: '18px' }}>Everything you need to manage your personal finances</Text>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card 
                    bordered={false} 
                    style={{ 
                      height: '100%', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      textAlign: 'center',
                      padding: '24px'
                    }}
                  >
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      margin: '0 auto 24px', 
                      background: '#fafafa', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '16px' }}>{feature.title}</Title>
                    <Paragraph type="secondary" style={{ fontSize: '16px' }}>
                      {feature.description}
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#001529', color: 'rgba(255,255,255,0.65)', padding: '64px 24px', textAlign: 'center' }}>
        <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>Finku</Title>
        <Text style={{ color: 'inherit' }}>© 2026 Finku. All rights reserved.</Text>
      </div>
    </div>
  );
};

export default LandingPage;
