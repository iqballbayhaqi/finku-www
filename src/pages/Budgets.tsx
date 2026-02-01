import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Card, Typography, Progress, Popconfirm, Tag, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';

const { Title } = Typography;
const { Option } = Select;

const Budgets: React.FC = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [form] = Form.useForm();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'IDR';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [budRes, catRes] = await Promise.all([
                api.get('/budgets', { params: filters }),
                api.get('/categories')
            ]);
            setBudgets(budRes.data);
            setCategories(catRes.data.filter((c: any) => c.type === 'EXPENSE'));
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/budgets/${id}`);
            message.success('Budget deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete budget');
        }
    };

    const handleAdd = () => {
        form.resetFields();
        form.setFieldsValue({
            month: filters.month,
            year: filters.year
        });
        setIsModalVisible(true);
    };

    const onFinish = async (values: any) => {
        try {
            await api.post('/budgets', values);
            message.success('Budget set');
            setIsModalVisible(false);
            fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to set budget');
        }
    };

    const columns = [
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Budget Limit',
            dataIndex: 'amount',
            render: (amount: number) => formatCurrency(amount, currency),
        },
        {
            title: 'Spent',
            dataIndex: 'spent',
            render: (spent: number) => formatCurrency(spent, currency),
        },
        {
            title: 'Remaining',
            dataIndex: 'remaining',
            render: (remaining: number) => <span style={{ color: remaining < 0 ? 'red' : 'green' }}>{formatCurrency(remaining, currency)}</span>,
        },
        {
            title: 'Progress',
            dataIndex: 'percentage',
            render: (percent: number) => (
                <Progress percent={Math.round(percent)} status={percent >= 100 ? 'exception' : 'active'} />
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>Budgets</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Set Budget</Button>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Select 
                            value={filters.month} 
                            style={{ width: '100%' }} 
                            onChange={(val) => setFilters({ ...filters, month: val })}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <Option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Input 
                            type="number" 
                            value={filters.year} 
                            onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })} 
                        />
                    </Col>
                </Row>
            </Card>

            <Table 
                columns={columns} 
                dataSource={budgets} 
                rowKey="id" 
                loading={loading} 
                pagination={false}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title="Set Budget"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <Input type="number" prefix={currency === 'IDR' ? 'Rp' : '$'} />
                    </Form.Item>
                    <Form.Item label="Period" style={{ marginBottom: 0 }}>
                        <Space>
                            <Form.Item name="month" rules={[{ required: true }]}>
                                <Select style={{ width: 120 }}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <Option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="year" rules={[{ required: true }]}>
                                <Input type="number" style={{ width: 100 }} />
                            </Form.Item>
                        </Space>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Save</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Budgets;
