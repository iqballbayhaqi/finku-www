import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Typography, Tag, Popconfirm, Avatar } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, BankOutlined, WalletOutlined, StockOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';

const { Title } = Typography;
const { Option } = Select;
const INVESTMENT_TYPES = ['REKSADANA', 'SAHAM', 'CRYPTO'] as const;
const NON_INVESTMENT_TYPES = ['BANK', 'E_WALLET', 'CASH', 'OTHER'] as const;
const TYPE_LABELS: Record<string, string> = {
    BANK: 'Bank',
    E_WALLET: 'E-Wallet',
    CASH: 'Cash',
    REKSADANA: 'Reksadana',
    SAHAM: 'Saham',
    CRYPTO: 'Crypto',
    OTHER: 'Other',
};

const Accounts: React.FC = () => {
    const location = useLocation();
    const isInvestmentMode = location.pathname === '/investments';
    const visibleTypes: string[] = isInvestmentMode ? [...INVESTMENT_TYPES] : [...NON_INVESTMENT_TYPES];
    const defaultType = isInvestmentMode ? 'REKSADANA' : 'CASH';
    const [accounts, setAccounts] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]); // Store filtered data
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'IDR';

    const [goals, setGoals] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accountsRes, goalsRes] = await Promise.all([
                api.get('/accounts'),
                api.get('/goals')
            ]);
            const scopedAccounts = accountsRes.data.filter((account: any) => visibleTypes.includes(account.type));
            setAccounts(scopedAccounts);
            setFilteredData(scopedAccounts); // Initialize filtered data
            setGoals(goalsRes.data);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isInvestmentMode]);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/accounts/${id}`);
            message.success('Account deleted');
            fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete account');
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ type: defaultType });
        setIsModalVisible(true);
    };

    const onFinish = async (values: any) => {
        try {
            if (editingId) {
                await api.put(`/accounts/${editingId}`, { 
                    ...values, 
                    balance: Number(values.balance), 
                    quantity: values.quantity ? Number(values.quantity) : null,
                    goalId: values.goalId ? Number(values.goalId) : null 
                });
                message.success('Account updated');
            } else {
                await api.post('/accounts', { 
                    ...values, 
                    balance: Number(values.balance), 
                    quantity: values.quantity ? Number(values.quantity) : null,
                    goalId: values.goalId ? Number(values.goalId) : null 
                });
                message.success('Account created');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('Failed to save account');
        }
    };

    const columns = [
        {
            title: 'Account Name',
            dataIndex: 'name',
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
            render: (text: string, record: any) => (
                <Space>
                    <Avatar src={record.imageUrl} icon={<WalletOutlined />} />
                    <strong>{text}</strong>
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            filters: visibleTypes.map((type) => ({ text: TYPE_LABELS[type], value: type })),
            onFilter: (value: any, record: any) => record.type === value,
            render: (type: string, record: any) => {
                let icon = <WalletOutlined />;
                if (type === 'BANK') icon = <BankOutlined />;
                else if (type === 'REKSADANA' || type === 'SAHAM' || type === 'CRYPTO') icon = <StockOutlined />;
                
                return (
                    <Space direction="vertical" size={0}>
                        <Tag icon={icon} color="blue">{TYPE_LABELS[type] || type}</Tag>
                        {record.stockSymbol && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.stockSymbol} x {record.quantity}</Typography.Text>}
                    </Space>
                );
            },
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            sorter: (a: any, b: any) => a.balance - b.balance,
            render: (balance: number) => formatCurrency(balance, currency),
        },
        {
            title: 'Linked Goal',
            dataIndex: 'goalId',
            render: (goalId: number | null) => {
                if (!goalId) return '-';
                const goal: any = goals.find((g: any) => g.id === goalId);
                return goal ? <Tag color="cyan">{goal.name}</Tag> : '-';
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm 
                        title="Delete account?" 
                        description="This will fail if it has transactions."
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>{isInvestmentMode ? 'Investasi' : 'Accounts'}</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    {isInvestmentMode ? 'Tambah Investasi' : 'Add Account'}
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={accounts} 
                rowKey="id" 
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{ 
                    ...pagination,
                    showSizeChanger: true, 
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total: number) => `Total ${total} items`,
                }}
                onChange={(pagination: any, _filters: any, _sorter: any, extra: any) => {
                    setPagination(prev => ({ ...prev, current: pagination.current || 1, pageSize: pagination.pageSize || prev.pageSize }));
                    if (extra.currentDataSource) {
                        setFilteredData(extra.currentDataSource); // Update filtered data
                    }
                }}
                summary={() => {
                    const totalBalance = filteredData.reduce((acc: number, curr: any) => acc + (Number(curr.balance) || 0), 0);
                    return (
                        <Table.Summary.Row style={{ background: '#fafafa' }}>
                            <Table.Summary.Cell index={0} colSpan={2}>
                                <div style={{ textAlign: 'right', paddingRight: 16 }}>
                                    <strong>{isInvestmentMode ? 'Total Semua Investasi:' : 'Total All Accounts:'}</strong>
                                </div>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>
                                <Typography.Text strong>
                                    {formatCurrency(totalBalance, currency)}
                                </Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} colSpan={2} />
                        </Table.Summary.Row>
                    );
                }}
            />

            <Modal
                title={editingId ? (isInvestmentMode ? 'Edit Investasi' : 'Edit Account') : (isInvestmentMode ? 'Tambah Investasi' : 'Add Account')}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: defaultType }}>
                    <Form.Item name="name" label="Account Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="Image URL (Optional)">
                        <Input placeholder="https://..." />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select>
                            {visibleTypes.map((type) => (
                                <Option key={type} value={type}>{TYPE_LABELS[type]}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                            return (type === 'SAHAM' || type === 'CRYPTO' || type === 'REKSADANA') ? (
                                <>
                                    <Form.Item name="stockSymbol" label="Symbol / Ticker" rules={[{ required: true, message: 'Example: BBCA, BTC, RD-BIBIT' }]}>
                                        <Input placeholder="e.g. BBCA, BTC" />
                                    </Form.Item>
                                    <Form.Item name="quantity" label="Quantity (Lots/Coins/Units)" rules={[{ required: true }]}>
                                        <Input type="number" step="any" />
                                    </Form.Item>
                                    <Form.Item name="goalId" label="Link to Goal (Portfolio)">
                                        <Select allowClear placeholder="Select a goal/portfolio">
                                            {goals.map((g: any) => (
                                                <Option key={g.id} value={g.id}>{g.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </>
                            ) : null;
                        }}
                    </Form.Item>

                    <Form.Item name="balance" label="Current Total Value (IDR)" rules={[{ required: true }]}>
                        <Input type="number" prefix={currency === 'IDR' ? 'Rp' : '$'} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Save</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Accounts;
