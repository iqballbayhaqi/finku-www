import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  message,
  Alert,
  Upload,
  Modal,
  Input,
} from "antd";
import {
  DownloadOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import api from "../apiClient";

const { Title, Paragraph } = Typography;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string | null>(
    null,
  );

  React.useEffect(() => {
    api
      .get("/backup/sheets/service-account")
      .then((res) => setServiceAccountEmail(res.data.email))
      .catch(() => setServiceAccountEmail(null));
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const response = await api.get("/backup/export", {
        responseType: "blob",
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finnan_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success("Backup downloaded successfully");
    } catch (error) {
      console.error("Backup failed:", error);
      message.error("Failed to download backup");
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
          title: "Are you sure you want to restore?",
          content:
            "This will DELETE ALL your current data (Transactions, Accounts, Goals, etc.) and replace it with the backup. This action cannot be undone.",
          okText: "Yes, Restore",
          okType: "danger",
          cancelText: "Cancel",
          onOk: async () => {
            try {
              await api.post("/backup/restore", json);
              message.success(
                "Data restored successfully! Please refresh or re-login.",
              );
              setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
              console.error("Restore error:", error);
              message.error("Failed to restore data");
            } finally {
              setLoading(false);
            }
          },
          onCancel: () => {
            setLoading(false);
          },
        });
      } catch (error) {
        message.error("Invalid backup file");
        setLoading(false);
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  const handleGoogleSheetsBackup = async () => {
    if (!spreadsheetId.trim()) {
      message.error("Please enter a valid Spreadsheet ID");
      return;
    }
    setSheetsLoading(true);
    try {
      await api.post("/backup/sheets/export", { spreadsheetId });
      message.success("Backup to Google Sheets successful!");
    } catch (error: any) {
      console.error("Google Sheets Backup failed:", error);
      message.error(
        error.response?.data?.message || "Failed to backup to Google Sheets",
      );
    } finally {
      setSheetsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <SettingOutlined
          style={{ fontSize: 24, marginRight: 12, color: "#1890ff" }}
        />
        <Title level={2} style={{ margin: 0 }}>
          Settings
        </Title>
      </div>

      <Card title="Data Management" style={{ maxWidth: 800 }}>
        <Alert
          message="Backup Your Data"
          description="You can download a complete backup of your Finnan data (transactions, accounts, budgets, etc.) as a JSON file. This file can be used to restore your data later or for your own records."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <Title level={5}>Export Database</Title>
            <Paragraph style={{ color: "#666", marginBottom: 0 }}>
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

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <Title level={5}>Google Sheets Backup</Title>
            <Paragraph style={{ color: "#666", marginBottom: 8 }}>
              Backup your data directly to a Google Spreadsheet. Ensure you have
              created a new Google Sheet and shared it with the service account
              email below as an <b>Editor</b>.
            </Paragraph>
            {serviceAccountEmail ? (
              <Alert
                type="info"
                message="Service Account Email"
                description={
                  <div>
                    Share your sheet with: <b>{serviceAccountEmail}</b>
                  </div>
                }
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                type="warning"
                message="Google Sheets Not Configured"
                description="The service account email is not configured on the server. Please contact the administrator."
                style={{ marginBottom: 16 }}
              />
            )}
            <Input
              placeholder="Enter Google Spreadsheet ID (e.g. 1BxiMVs0XRY...)"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              style={{ maxWidth: 400, marginBottom: 8 }}
              disabled={!serviceAccountEmail}
            />
          </div>
          <Button
            type="primary"
            onClick={handleGoogleSheetsBackup}
            loading={sheetsLoading}
            size="large"
            disabled={!serviceAccountEmail || !spreadsheetId.trim()}
          >
            Backup to Sheets
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <Title level={5} type="danger">
              Restore Database
            </Title>
            <Paragraph style={{ color: "#666", marginBottom: 0 }}>
              Restore data from a backup file.{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                Warning: This will replace all current data.
              </span>
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
