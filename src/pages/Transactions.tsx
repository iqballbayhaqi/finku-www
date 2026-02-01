import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, DatePicker, message, Card, Typography, Tag, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        startDate: dayjs().startOf('day').toISOString(),
        endDate: dayjs().endOf('day').toISOString(),
    });
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [form] = Form.useForm();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'IDR';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [txRes, catRes, accRes, goalRes, debtRes] = await Promise.all([
                api.get('/transactions', { params: filters }),
                api.get('/categories'),
                api.get('/accounts'),
                api.get('/goals'),
                api.get('/debts')
            ]);
            setTransactions(txRes.data);
            setCategories(catRes.data);
            setAccounts(accRes.data);
            setGoals(goalRes.data.filter((g: any) => g.status === 'IN_PROGRESS'));
            setDebts(debtRes.data.filter((d: any) => d.status === 'UNPAID'));
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [filters]);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/transactions/${id}`);
            message.success('Transaction deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete transaction');
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/transactions/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            message.error('Failed to export data');
        }
    };

    const onFinish = async (values: any) => {
        try {
            await api.post('/transactions', values);
            message.success('Transaction added');
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('Failed to add transaction');
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
            sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            render: (text: string, record: any) => (
                <div>
                    <div>{text}</div>
                    {record.debt && (
                        <Tag color="purple" style={{ fontSize: 10 }}>Link: {record.debt.personName}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type: string) => {
                let color = 'default';
                if (type === 'INCOME') color = 'green';
                if (type === 'EXPENSE') color = 'red';
                if (type === 'TRANSFER') color = 'blue';
                return <Tag color={color}>{type}</Tag>;
            },
            filters: [
                { text: 'Income', value: 'INCOME' },
                { text: 'Expense', value: 'EXPENSE' },
                { text: 'Transfer', value: 'TRANSFER' },
            ],
            onFilter: (value: any, record: any) => record.type === value,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (amount: number, record: any) => (
                <span style={{ 
                    color: record.type === 'EXPENSE' ? 'red' : record.type === 'INCOME' ? 'green' : 'blue' 
                }}>
                    {record.type === 'EXPENSE' ? '-' : record.type === 'INCOME' ? '+' : ''}
                    {formatCurrency(amount, currency)}
                </span>
            ),
            sorter: (a: any, b: any) => a.amount - b.amount,
        },
        {
            title: 'Account',
            dataIndex: ['account', 'name'],
            render: (text: string, record: any) => {
                if (record.type === 'TRANSFER' && record.targetAccount) {
                    return <span>{text} &rarr; {record.targetAccount.name}</span>;
                }
                return text || '-';
            },
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
                <Title level={2} style={{ margin: 0 }}>Transactions</Title>
                <Space wrap>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add New</Button>
                </Space>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                         <RangePicker 
                            style={{ width: '100%' }} 
                            defaultValue={[dayjs().startOf('day'), dayjs().endOf('day')]}
                            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : undefined}
                            onChange={(dates) => {
                                if (dates) {
                                    setFilters({ ...filters, startDate: dates[0]?.toISOString(), endDate: dates[1]?.toISOString() });
                                } else {
                                    const { startDate, endDate, ...rest } = filters;
                                    setFilters(rest);
                                }
                            }}
                         />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select 
                            placeholder="Filter by Category" 
                            allowClear 
                            style={{ width: '100%' }}
                            onChange={(value) => {
                                if (value) setFilters({ ...filters, categoryId: value });
                                else {
                                    const { categoryId, ...rest } = filters;
                                    setFilters(rest);
                                }
                            }}
                        >
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Table 
                columns={columns} 
                dataSource={transactions} 
                rowKey="id" 
                loading={loading} 
                pagination={{ 
                    ...pagination,
                    showSizeChanger: true, 
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => `Total ${total} items`,
                    onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }))
                }}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title="Add Transaction"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select onChange={() => {
                            form.setFieldsValue({ categoryId: null });
                            // Force update to handle field visibility
                        }}>
                            <Option value="EXPENSE">Expense</Option>
                            <Option value="INCOME">Income</Option>
                            <Option value="TRANSFER">Transfer</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item 
                        noStyle 
                        shouldUpdate={(prev, cur) => prev.type !== cur.type}
                    >
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                            return type === 'TRANSFER' ? (
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="accountId" label="Source Account" rules={[{ required: true, message: 'Source required' }]}>
                                            <Select allowClear placeholder="From">
                                                {accounts.map(a => <Option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, currency)})</Option>)}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="targetAccountId" label="Target Account" rules={[{ required: true, message: 'Target required' }]}>
                                            <Select allowClear placeholder="To">
                                                 {accounts.map(a => <Option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, currency)})</Option>)}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ) : (
                                <Form.Item name="accountId" label="Account (Optional)">
                                    <Select allowClear>
                                        {accounts.map(a => <Option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, currency)})</Option>)}
                                    </Select>
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <Input type="number" prefix={currency === 'IDR' ? 'Rp' : '$'} />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                     {/* For Transfer, we might default Category or let user pick. Schema requires it. */}
                     <Form.Item 
                        noStyle 
                        shouldUpdate={(prev, cur) => prev.type !== cur.type}
                    >
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                             // Show Category selection unless it's Transfer, but for now allow Transfer to pick too or handle it?
                             // Let's filter categories. If type is TRANSFER, show all or specific?
                             // Usually Transfers don't need detailed categories, but let's allow "Others" or similar.
                             // Or just show all categories.
                            return (
                                <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                                    <Select>
                                        {categories
                                            .filter(c => !type || type === 'TRANSFER' || c.type === type) 
                                            .map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)
                                        }
                                    </Select>
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                            if (type === 'TRANSFER') return null; // Hide Goal/Debt for Transfer
                            return (
                                <>
                                    <Form.Item name="goalId" label="Link to Goal (Optional)">
                                        <Select allowClear placeholder="Select a goal to update its balance">
                                            {goals.map(g => <Option key={g.id} value={g.id}>{g.name} (Current: {formatCurrency(g.currentAmount, currency)})</Option>)}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="debtId" label="Link to Debt/Receivable (Optional)">
                                        <Select allowClear placeholder="Select a debt record">
                                            {debts.map(d => (
                                                <Option key={d.id} value={d.id}>
                                                    {d.personName} - {d.type} ({formatCurrency(d.amount, currency)})
                                                    {d.totalInstallments ? ` • Cicilan ${d.currentInstallment ?? 0}/${d.totalInstallments}` : ''}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </>
                            );
                        }}
                    </Form.Item>

                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Submit</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Transactions;
