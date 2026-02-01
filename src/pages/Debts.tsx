import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, DatePicker, Select, message, Typography, Tag, Popconfirm, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface Debt {
    id: number;
    personName: string;
    amount: number;
    dueDate: string | null;
    type: 'PAYABLE' | 'RECEIVABLE';
    status: 'UNPAID' | 'PAID';
    description?: string;
    totalInstallments?: number | null;
    currentInstallment?: number | null;
}

const Debts: React.FC = () => {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'IDR';

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/debts');
            setDebts(response.data);
        } catch {
            message.error('Failed to fetch debts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/debts/${id}`);
            message.success('Record deleted');
            fetchData();
        } catch {
            message.error('Failed to delete record');
        }
    };

    const handleMarkPaid = async (record: Debt) => {
        try {
            await api.put(`/debts/${record.id}`, { ...record, status: 'PAID' });
            message.success('Marked as Paid');
            fetchData();
        } catch {
            message.error('Failed to update status');
        }
    };

    const handleEdit = (record: Debt) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            dueDate: record.dueDate ? dayjs(record.dueDate) : null
        });
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            const payload = {
                ...values,
                amount: Number(values.amount),
                totalInstallments: values.totalInstallments ? Number(values.totalInstallments) : undefined,
                currentInstallment: values.currentInstallment ? Number(values.currentInstallment) : undefined,
            };

            if (editingId) {
                await api.put(`/debts/${editingId}`, payload);
                message.success('Updated successfully');
            } else {
                await api.post('/debts', payload);
                message.success('Created successfully');
            }
            setIsModalVisible(false);
            fetchData();
        } catch {
            message.error('Failed to save');
        }
    };

    const columns = [
        {
            title: 'Person Name',
            dataIndex: 'personName',
            sorter: (a: Debt, b: Debt) => a.personName.localeCompare(b.personName),
            render: (text: string, record: Debt) => (
                <div>
                    <div><strong>{text}</strong></div>
                    {record.totalInstallments && (
                        <div style={{ fontSize: 12, color: 'gray' }}>
                            Cicilan {record.currentInstallment || '?'}/{record.totalInstallments}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            filters: [
                { text: 'Hutang', value: 'PAYABLE' },
                { text: 'Piutang', value: 'RECEIVABLE' },
            ],
            onFilter: (value: React.Key | boolean, record: Debt) => record.type === value,
            render: (type: string) => (
                <Tag color={type === 'PAYABLE' ? 'red' : 'green'}>
                    {type === 'PAYABLE' ? 'Hutang (I owe)' : 'Piutang (Owed to me)'}
                </Tag>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            sorter: (a: Debt, b: Debt) => a.amount - b.amount,
            render: (amount: number, record: Debt) => {
                const isCicilan = record.totalInstallments && record.totalInstallments > 0;
                const current = record.currentInstallment ?? 0;
                const total = record.totalInstallments ?? 1;
                const remaining = isCicilan && record.status === 'UNPAID'
                    ? amount * (total - current) / total
                    : null;
                return (
                    <div>
                        <div>{formatCurrency(amount, currency)}</div>
                        {remaining != null && remaining > 0 && (
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                                Total sisa: {formatCurrency(remaining, currency)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            sorter: (a: Debt, b: Debt) => {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                return dateA - dateB;
            },
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: [
                { text: 'PAID', value: 'PAID' },
                { text: 'UNPAID', value: 'UNPAID' },
            ],
            onFilter: (value: React.Key | boolean, record: Debt) => record.status === value,
            render: (status: string) => (
                <Tag color={status === 'PAID' ? 'blue' : 'default'}>{status}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: Debt) => (
                <Space size="middle">
                    {record.status === 'UNPAID' && (
                        <Button 
                            icon={<CheckOutlined />} 
                            title="Mark as Paid" 
                            onClick={() => handleMarkPaid(record)} 
                        />
                    )}
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
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
                <Title level={2} style={{ margin: 0 }}>Debts & Receivables</Title>
                <Space wrap>
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={async () => {
                            try {
                                const response = await api.get('/debts/export', { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'debts.xlsx');
                                document.body.appendChild(link);
                                link.click();
                            } catch {
                                message.error('Failed to export data');
                            }
                        }}
                    >
                        Export
                    </Button>
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={async () => {
                            try {
                                const response = await api.get('/debts/template', { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'debt_template.xlsx');
                                document.body.appendChild(link);
                                link.click();
                            } catch {
                                message.error('Failed to download template');
                            }
                        }}
                    >
                        Template
                    </Button>
                    <Upload 
                        showUploadList={false}
                        customRequest={async (options) => {
                            const { file, onSuccess, onError } = options;
                            const formData = new FormData();
                            formData.append('file', file as Blob);
                            
                            try {
                                const response = await api.post('/debts/import', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                message.success(response.data.message);
                                onSuccess?.(response.data);
                                fetchData();
                            } catch (error) {
                                message.error('Upload failed');
                                onError?.(error as Error);
                            }
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Import Excel</Button>
                    </Upload>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Record</Button>
                </Space>
            </div>

            <Table 
                columns={columns} 
                dataSource={debts} 
                rowKey="id" 
                loading={loading}
                scroll={{ x: 'max-content' }}
                rowClassName={(record) => record.status === 'PAID' ? 'debt-row-paid' : ''}
                pagination={{ 
                    ...pagination,
                    showSizeChanger: true, 
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => `Total ${total} items`,
                    onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }))
                }}
            />

            <Modal
                title={editingId ? "Edit Record" : "Add Record"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'PAYABLE', status: 'UNPAID' }}>
                    <Form.Item name="personName" label="Person Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="PAYABLE">Hutang (I owe money)</Option>
                            <Option value="RECEIVABLE">Piutang (They owe me)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <Input type="number" prefix={currency === 'IDR' ? 'Rp' : '$'} />
                    </Form.Item>
                    <Form.Item name="dueDate" label="Due Date">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item label="Installments (Optional)" style={{ marginBottom: 0 }}>
                        <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item name="currentInstallment" label="Current (ke-)" style={{ width: 120 }}>
                                <Input type="number" placeholder="e.g. 1" />
                            </Form.Item>
                            <span style={{ paddingTop: 30 }}>of</span>
                            <Form.Item name="totalInstallments" label="Total (x)" style={{ width: 120 }}>
                                <Input type="number" placeholder="e.g. 12" />
                            </Form.Item>
                        </Space>
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="UNPAID">Unpaid</Option>
                            <Option value="PAID">Paid</Option>
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

export default Debts;
