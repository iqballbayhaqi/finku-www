import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Typography, Tag, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';
import api from '../apiClient';

const { Title } = Typography;
const { Option } = Select;

const Categories: React.FC = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('EXPENSE');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            message.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/categories/${id}`);
            message.success('Category deleted');
            fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete category');
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
        form.setFieldsValue({ type: activeTab });
        setIsModalVisible(true);
    };

    const onFinish = async (values: any) => {
        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, values);
                message.success('Category updated');
            } else {
                await api.post('/categories', values);
                message.success('Category created');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('Failed to save category');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text: string) => <Tag color="geekblue">{text}</Tag>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type: string) => (
                <Tag color={type === 'EXPENSE' ? 'red' : 'green'}>{type}</Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm 
                        title="Delete category?" 
                        description="This might fail if used in transactions."
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredCategories = categories.filter((c: any) => c.type === activeTab);

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>Categories</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Category</Button>
            </div>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                    { key: 'EXPENSE', label: 'Expenses', icon: <TagsOutlined /> },
                    { key: 'INCOME', label: 'Income', icon: <TagsOutlined /> },
                ]}
            />

            <Table 
                columns={columns} 
                dataSource={filteredCategories} 
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
                title={editingId ? "Edit Category" : "Add Category"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="EXPENSE">Expense</Option>
                            <Option value="INCOME">Income</Option>
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

export default Categories;
