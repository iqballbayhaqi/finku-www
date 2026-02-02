import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Select, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { message: messageApi } = App.useApp();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/auth/register', values);
            messageApi.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            messageApi.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            background: '#f0f2f5',
            padding: '16px'
        }}>
            <Card style={{ width: '100%', maxWidth: 400, margin: '0 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>Finnan</Title>
                    <Text type="secondary">Create your account</Text>
                </div>
                
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    initialValues={{ currency: 'IDR' }}
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please input your Name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Invalid email format' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label="Preferred Currency"
                        rules={[{ required: true, message: 'Please select your currency!' }]}
                    >
                        <Select>
                            <Option value="IDR">IDR (Indonesian Rupiah)</Option>
                            <Option value="USD">USD (US Dollar)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Register
                        </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center' }}>
                        Already have an account? <Link to="/login">Login now!</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
