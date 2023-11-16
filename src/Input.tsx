import { Input, Button, Space, Card } from "antd";
import React, { useEffect, useState } from "react";

export const APIInput = () => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Load apiKey from chrome storage
    // @ts-ignore
    chrome.storage.sync.get(["localLLMUrl"], (res) => {
      setUrl(res.localLLMUrl);
    });
  }, []);

  return (
    <Card title="LLM Endpoint" bordered={false}>
      <Space direction="horizontal">
        <Input
          placeholder="URL"
          style={{ width: 250 }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          type="primary"
          onClick={() => {
            chrome.storage.sync.set({ localLLMUrl: url });
          }}
        >
          Save
        </Button>
      </Space>
    </Card>
  );
};