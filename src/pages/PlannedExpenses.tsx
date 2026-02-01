import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Card, Typography, Popconfirm, Tag, Row, Col, DatePicker, Statistic 
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const PlannedExpenses: React.FC = () => {
  const [plannedExpenses, setPlannedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: undefined
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currency = user.currency || 'IDR';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.status) params.status = filters.status;

      const [plannedRes, catRes, accRes] = await Promise.all([
        api.get('/planned-expenses', { params }),
        api.get('/categories'),
        api.get('/accounts')
      ]);
      
      setPlannedExpenses(plannedRes.data);
      setCategories(catRes.data.filter((c: any) => c.type === 'EXPENSE'));
      setAccounts(accRes.data);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [filters]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/planned-expenses/${id}`);
      message.success('Planned expense deleted');
      fetchData();
    } catch (error) {
      message.error('Failed to delete planned expense');
    }
  };

  const handleExecute = async (id: number) => {
    try {
      await api.post(`/planned-expenses/${id}/execute`);
      message.success('Status diperbarui menjadi executed');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to execute planned expense');
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs()
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    });
    setIsModalVisible(true);
  };

  const onFinish = async (values: any) => {
    try {
      const data = {
        ...values,
        date: values.date.toISOString()
      };

      if (editingId) {
        await api.put(`/planned-expenses/${editingId}`, data);
        message.success('Planned expense updated');
      } else {
        await api.post('/planned-expenses', data);
        message.success('Planned expense created');
      }
      
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save planned expense');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'EXECUTED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Account',
      dataIndex: ['account', 'name'],
      render: (text: string) => text || <Tag>No Account</Tag>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount: number) => formatCurrency(amount, currency),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.status === 'PLANNED' && (
            <>
              <Popconfirm 
                title="Execute this planned expense?" 
                onConfirm={() => handleExecute(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CheckOutlined />}
                >
                  Execute
                </Button>
              </Popconfirm>
              <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
            </>
          )}
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalPlanned = plannedExpenses
    .filter((pe: any) => pe.status === 'PLANNED')
    .reduce((sum: number, pe: any) => sum + pe.amount, 0);

  const totalExecuted = plannedExpenses
    .filter((pe: any) => pe.status === 'EXECUTED')
    .reduce((sum: number, pe: any) => sum + pe.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Planned Expenses</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Planned Expense
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Planned"
              value={totalPlanned}
              formatter={(value) => formatCurrency(Number(value), currency)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Executed"
              value={totalExecuted}
              formatter={(value) => formatCurrency(Number(value), currency)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Items"
              value={plannedExpenses.length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={filters.month}
              style={{ width: '100%' }}
              onChange={(val) => setFilters({ ...filters, month: val })}
              placeholder="Select Month"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <Option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
              placeholder="Year"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={filters.status}
              style={{ width: '100%' }}
              onChange={(val) => setFilters({ ...filters, status: val })}
              placeholder="Filter by Status"
              allowClear
            >
              <Option value="PLANNED">Planned</Option>
              <Option value="EXECUTED">Executed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={plannedExpenses}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total ${total} items`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }));
          },
        }}
      />

      <Modal
        title={editingId ? 'Edit Planned Expense' : 'Add Planned Expense'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="date" label="Expected Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="accountId" label="Account">
            <Select showSearch optionFilterProp="children" allowClear>
              {accounts.map(a => <Option key={a.id} value={a.id}>{a.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" prefix={currency === 'IDR' ? 'Rp' : '$'} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlannedExpenses;
