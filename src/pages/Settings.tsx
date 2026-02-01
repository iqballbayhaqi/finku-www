import React, { useState } from 'react';
import { Card, Button, Typography, message, Alert, Upload, Modal } from 'antd';
import { DownloadOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Settings: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleBackup = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/backup/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finku_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            message.success('Backup downloaded successfully');
        } catch (error) {
            console.error('Backup failed:', error);
            message.error('Failed to download backup');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (file: File) => {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                
                // Confirm dialog
                Modal.confirm({
                    title: 'Are you sure you want to restore?',
                    content: 'This will DELETE ALL your current data (Transactions, Accounts, Goals, etc.) and replace it with the backup. This action cannot be undone.',
                    okText: 'Yes, Restore',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk: async () => {
                         try {
                            const token = localStorage.getItem('token');
                            const response = await fetch('http://localhost:3000/api/backup/restore', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(json)
                            });

                            if (!response.ok) {
                                throw new Error('Restore failed');
                            }

                            message.success('Data restored successfully! Please refresh or re-login.');
                            setTimeout(() => window.location.reload(), 1500);
                        } catch (error) {
                            console.error('Restore error:', error);
                            message.error('Failed to restore data');
                        } finally {
                            setLoading(false);
                        }
                    },
                    onCancel: () => {
                        setLoading(false);
                    }
                });

            } catch (error) {
                message.error('Invalid backup file');
                setLoading(false);
            }
        };
        reader.readAsText(file);
        return false; // Prevent upload
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <SettingOutlined style={{ fontSize: 24, marginRight: 12, color: '#1890ff' }} />
                <Title level={2} style={{ margin: 0 }}>Settings</Title>
            </div>
            
            <Card title="Data Management" style={{ maxWidth: 800 }}>
                <Alert
                    message="Backup Your Data"
                    description="You can download a complete backup of your FinKu data (transactions, accounts, budgets, etc.) as a JSON file. This file can be used to restore your data later or for your own records."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <Title level={5}>Export Database</Title>
                        <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                            Download all your data in JSON format.
                        </Paragraph>
                    </div>
                    <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={handleBackup}
                        loading={loading}
                        size="large"
                    >
                        Download Backup
                    </Button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <Title level={5} type="danger">Restore Database</Title>
                        <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                            Restore data from a backup file. <span style={{ color: 'red', fontWeight: 'bold' }}>Warning: This will replace all current data.</span>
                        </Paragraph>
                    </div>
                     <Upload 
                        accept=".json" 
                        showUploadList={false}
                        beforeUpload={handleRestore}
                    >
                        <Button 
                            danger
                            icon={<UploadOutlined />} 
                            loading={loading}
                            size="large"
                        >
                            Restore Data
                        </Button>
                    </Upload>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
