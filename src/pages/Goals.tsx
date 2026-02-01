import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, DatePicker, Select, message, Typography, Progress, Popconfirm, Tag, Card, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, PictureOutlined } from '@ant-design/icons';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

const Goals: React.FC = () => {
    const [goals, setGoals] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const linkedAccountId = Form.useWatch('accountId', form);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'IDR';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsRes, accountsRes] = await Promise.all([
                api.get('/goals'),
                api.get('/accounts')
            ]);
            setGoals(goalsRes.data);
            setAccounts(accountsRes.data);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/goals/${id}`);
            message.success('Goal deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete goal');
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        const accountId = record.accountId || undefined;
        const linkedAccount = accountId ? accounts.find((a: any) => a.id === accountId) : null;
        const currentAmount = linkedAccount ? linkedAccount.balance : record.currentAmount;
        form.setFieldsValue({
            ...record,
            deadline: record.deadline ? dayjs(record.deadline) : null,
            accountId,
            currentAmount
        });
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const onFinish = async (values: any) => {
        try {
            const payload = {
                ...values,
                targetAmount: Number(values.targetAmount),
                currentAmount: Number(values.currentAmount || 0),
                accountId: values.accountId ? Number(values.accountId) : null
            };

            if (editingId) {
                await api.put(`/goals/${editingId}`, payload);
                message.success('Goal updated');
            } else {
                await api.post('/goals', payload);
                message.success('Goal created');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('Failed to save goal');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'active';
            default: return 'exception';
        }
    };

    const formatPercent = (p: number) => {
        if (p >= 100) return '100%';
        if (p <= 0) return '0%';
        if (p < 1) return `${Number(p.toFixed(5))}%`; // tampilkan desimal untuk nilai kecil, e.g. 0.21321%
        return `${p.toFixed(1)}%`;
    };

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>Saving Goals</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>New Goal</Button>
            </div>

            <Row gutter={[16, 16]}>
                {goals.map((goal: any) => {
                     const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                     return (
                        <Col xs={24} sm={12} md={8} lg={6} key={goal.id}>
                            <Card
                                cover={
                                    goal.imageUrl ? (
                                        <img 
                                            alt={goal.name} 
                                            src={goal.imageUrl} 
                                            style={{ height: 150, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ height: 150, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <PictureOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                                        </div>
                                    )
                                }
                                actions={[
                                    <EditOutlined key="edit" onClick={() => handleEdit(goal)} />,
                                    <Popconfirm title="Delete?" onConfirm={() => handleDelete(goal.id)}>
                                        <DeleteOutlined key="delete" style={{ color: 'red' }} />
                                    </Popconfirm>
                                ]}
                            >
                                <Meta 
                                    title={goal.name}
                                    description={
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <Tag color={goal.status === 'COMPLETED' ? 'green' : 'blue'}>{goal.status}</Tag>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text type="secondary">Target: </Text>
                                                <Text strong>{formatCurrency(goal.targetAmount, currency)}</Text>
                                            </div>
                                            <Progress 
                                                percent={percent} 
                                                status={getStatusColor(goal.status)} 
                                                size="small" 
                                                showInfo={false}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(goal.currentAmount, currency)}</Text>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{formatPercent(percent)}</Text>
                                            </div>
                                            {goal.linkedAccounts && goal.linkedAccounts.length > 0 && (
                                                <div style={{ marginTop: 8, borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>Investments:</Text>
                                                    {goal.linkedAccounts.map((acc: any) => (
                                                        <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                            <span>{acc.name}</span>
                                                            <span>{formatCurrency(acc.balance, currency)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {goal.account && (
                                                 <div style={{ marginTop: 8 }}>
                                                    <Tag color="cyan" style={{ margin: 0 }}>Source: {goal.account.name}</Tag>
                                                </div>
                                            )}
                                            {goal.deadline && (
                                                <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                                                    Ends: {new Date(goal.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                     );
                })}
            </Row>

            <Modal
                title={editingId ? "Edit Goal" : "New Goal"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'IN_PROGRESS' }}>
                    <Form.Item name="name" label="Goal Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="Image URL (Optional)">
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>
                    <Form.Item name="targetAmount" label="Target Amount" rules={[{ required: true }]}>
                        <Input type="number" prefix={currency === 'IDR' ? 'Rp' : '$'} />
                    </Form.Item>
                    <Form.Item
                        name="currentAmount"
                        label="Current Amount Saved"
                        dependencies={['accountId']}
                    >
                        <Input
                            type="number"
                            prefix={currency === 'IDR' ? 'Rp' : '$'}
                            disabled={!!linkedAccountId}
                            readOnly={!!linkedAccountId}
                        />
                    </Form.Item>
                    <Form.Item name="accountId" label="Link Account (Optional)">
                        <Select
                            allowClear
                            placeholder="Select an account"
                            onChange={(value) => {
                                const acc = value ? accounts.find((a: any) => a.id === value) : null;
                                if (acc) {
                                    form.setFieldValue('currentAmount', acc.balance);
                                }
                            }}
                        >
                            {accounts.map((acc: any) => (
                                <Option key={acc.id} value={acc.id}>
                                    {acc.name} ({acc.type}) - {formatCurrency(acc.balance, currency)}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="deadline" label="Deadline">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="IN_PROGRESS">In Progress</Option>
                            <Option value="COMPLETED">Completed</Option>
                            <Option value="CANCELLED">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Save</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Goals;
