import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Progress, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, GoldOutlined, TrophyOutlined } from '@ant-design/icons';
import api from '../apiClient';
import { formatCurrency } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const { Title, Text } = Typography;

const MAX_LEGEND_ITEMS = 6;

const limitChartData = (data: { name: string; value: number }[] | undefined, maxItems: number = MAX_LEGEND_ITEMS) => {
    if (!data || data.length <= maxItems) return data || [];
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, maxItems);
    const rest = sorted.slice(maxItems);
    const othersValue = rest.reduce((sum, item) => sum + item.value, 0);
    if (othersValue > 0) {
        top.push({ name: 'Lainnya', value: othersValue });
    }
    return top;
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'IDR';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const getHealthColor = (score: number) => {
        if (score >= 80) return '#52c41a';
        if (score >= 50) return '#faad14';
        return '#f5222d';
    };

    return (
        <div>
            <Title level={2}>Dashboard</Title>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic 
                            title="Net Worth" 
                            value={stats?.netWorth} 
                            formatter={(value) => formatCurrency(Number(value), currency)}
                            prefix={<GoldOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic 
                            title="Total Cash" 
                            value={stats?.totalCash}
                            formatter={(value) => formatCurrency(Number(value), currency)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic 
                            title="Receivables (Piutang)" 
                            value={stats?.receivables}
                            styles={{ content: { color: '#3f8600' } }}
                            prefix={<ArrowUpOutlined />}
                            formatter={(value) => formatCurrency(Number(value), currency)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic 
                            title="Payables (Hutang)" 
                            value={stats?.payables}
                            styles={{ content: { color: '#cf1322' } }}
                            prefix={<ArrowDownOutlined />}
                            formatter={(value) => formatCurrency(Number(value), currency)}
                        />
                    </Card>
                </Col>
            </Row>

            {stats?.totalCashHistory && stats.totalCashHistory.length >= 2 && (
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card title="Total Cash Trend (Harian)">
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.totalCashHistory} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} />
                                        <RechartsTooltip formatter={(value) => [formatCurrency(Number(value || 0), currency)]} labelFormatter={(v) => new Date(v).toLocaleDateString('id-ID')} />
                                        <Line type="monotone" dataKey="totalCash" stroke="#1890ff" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} md={8}>
                    <Card title="Financial Health" extra={<TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Title level={3} style={{ marginBottom: 0 }}>{stats?.wealthLevel}</Title>
                            <Text type="secondary">Wealth Level</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Progress 
                                type="circle" 
                                percent={stats?.healthScore} 
                                format={() => `${stats?.healthScore}`} 
                                strokeColor={getHealthColor(stats?.healthScore)}
                            />
                            <div style={{ marginTop: 8 }}><Text>Health Score</Text></div>
                        </div>
                        {stats?.amountToNextLevel != null && stats.amountToNextLevel > 0 && stats?.nextLevel && (
                            <div style={{ 
                                marginTop: 16, 
                                padding: 12, 
                                background: '#f6ffed', 
                                borderRadius: 8, 
                                border: '1px solid #b7eb8f',
                                textAlign: 'center'
                            }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Kurang </Text>
                                <Text strong style={{ color: '#389e0d' }}>{formatCurrency(stats.amountToNextLevel, currency)}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}> lagi untuk naik ke </Text>
                                <Text strong>{stats.nextLevel}</Text>
                            </div>
                        )}
                        {stats?.wealthLevel === 'SULTAN' && (
                            <div style={{ 
                                marginTop: 16, 
                                padding: 12, 
                                background: '#fffbe6', 
                                borderRadius: 8, 
                                border: '1px solid #ffe58f',
                                textAlign: 'center'
                            }}>
                                <Text strong style={{ color: '#faad14' }}>Anda sudah di level tertinggi!</Text>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                     <Card title="Expense Composition">
                        {stats?.expenseChartData && stats.expenseChartData.length > 0 ? (
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={limitChartData(stats.expenseChartData)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {limitChartData(stats.expenseChartData).map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [formatCurrency(Number(value || 0), currency)]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 50 }}>No expense data yet</div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                     <Card title="Account Composition">
                        {stats?.accountChartData && stats.accountChartData.length > 0 ? (
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={limitChartData(stats.accountChartData)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#00C49F"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {limitChartData(stats.accountChartData).map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [formatCurrency(Number(value || 0), currency)]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 50 }}>No account data yet</div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Recent Transactions">
                        <Table 
                            dataSource={stats?.recentTransactions} 
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            columns={[
                                { title: 'Date', dataIndex: 'date', render: (text: string) => new Date(text).toLocaleDateString() },
                                { title: 'Description', dataIndex: 'description' },
                                { title: 'Category', dataIndex: ['category', 'name'], render: (text: string) => <Tag color="blue">{text}</Tag> },
                                { 
                                    title: 'Amount', 
                                    dataIndex: 'amount', 
                                    render: (amount: number, record: any) => (
                                        <Text type={record.type === 'EXPENSE' ? 'danger' : 'success'}>
                                            {record.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(amount, currency)}
                                        </Text>
                                    ) 
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
