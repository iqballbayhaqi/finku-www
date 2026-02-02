import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Light premium gradient
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Title style={{ fontSize: '120px', margin: 0, color: '#1890ff', lineHeight: 1 }}>
          404
        </Title>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Title level={2} style={{ marginBottom: '16px' }}>
          Page Not Found
        </Title>
        <Text style={{ fontSize: '18px', color: '#595959', display: 'block', marginBottom: '32px' }}>
          Oops! The page you are looking for does not exist.
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button 
          type="primary" 
          size="large" 
          icon={<HomeOutlined />} 
          onClick={() => navigate('/')}
          style={{ 
            height: '48px', 
            padding: '0 32px', 
            fontSize: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px 0 rgba(24, 144, 255, 0.39)'
          }}
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
