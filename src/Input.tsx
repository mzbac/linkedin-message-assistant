import { Input, Button, Space, Card, Select } from "antd";
import React, { useEffect, useState } from "react";

const { Option } = Select;

export const APIInput = () => {
  const [url, setUrl] = useState("");
  const [apiType, setApiType] = useState("LLamacpp");

  useEffect(() => {
    // Load apiKey and apiType from chrome storage
    // @ts-ignore
    chrome.storage.sync.get(["localLLMUrl", "apiType"], (res) => {
      setUrl(res.localLLMUrl);
      setApiType(res.apiType || "LLamacpp");
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ localLLMUrl: url, apiType });
  };

  return (
    <Card title="LLM Endpoint" bordered={false} style={{ minWidth: '500px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Select
          defaultValue="LLamacpp"
          style={{ width: '100%' }}
          value={apiType}
          onChange={setApiType}
        >
          <Option value="LLamacpp">LLamacpp API</Option>
          <Option value="TGI">TGI API</Option>
        </Select>
        <Space direction="horizontal" className="custom-space-item" style={{ width: '100%' }}>
          <Input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="primary" onClick={saveSettings}>
            Save
          </Button>
        </Space>
      </Space>
    </Card>
  );
};
