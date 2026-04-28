import { Alert, Button, Card, Col, Descriptions, Empty, Flex, Input, Row, Space, Spin, Typography, theme } from "antd";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useChatDocumentMutation, useGetDocumentQuery } from "../store/apiSlice";
import { getApiBaseUrl } from "../lib/apiBase";
import { getApiErrorMessage } from "../utils/rtkError";

type ChatTurn = { role: "user" | "assistant"; text: string };

export function DocumentDetailPage() {
  const { token } = theme.useToken();
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatTurn[]>([]);

  const { data, isFetching, error } = useGetDocumentQuery(id, { skip: !id });
  const [sendChat, { isLoading: chatLoading }] = useChatDocumentMutation();

  const doc = data?.document;
  const fileUrl = id ? `${getApiBaseUrl()}/documents/${encodeURIComponent(id)}/file` : "";
  const detailError = error ? getApiErrorMessage(error, "Could not load document details.") : null;

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginMD} style={{ marginBottom: token.marginLG }}>
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {doc?.originalName ?? "Document details"}
          </Typography.Title>
          <Typography.Text type="secondary">Review extracted content and chat with this document.</Typography.Text>
        </div>
        <Space>
          <Link to="/dashboard">Dashboard</Link>
          <Button onClick={() => navigate("/documents")}>Back to documents</Button>
        </Space>
      </Flex>

      {detailError ? <Alert type="error" message={detailError} showIcon style={{ marginBottom: token.marginMD }} /> : null}

      <Spin spinning={isFetching}>
        {!doc ? (
          <Card>
            <Empty description="Document not found." />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={11}>
              <Card title="Document preview">
                <div
                  style={{
                    marginTop: token.marginMD,
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadius,
                    minHeight: 540,
                    padding: token.paddingXS,
                  }}
                >
                  {doc.contentType.startsWith("image/") ? (
                    <img
                      src={fileUrl}
                      alt={doc.originalName}
                      style={{ width: "100%", maxHeight: 520, objectFit: "contain", borderRadius: token.borderRadius }}
                    />
                  ) : doc.contentType === "application/pdf" ? (
                    <iframe
                      title={doc.originalName}
                      src={fileUrl}
                      style={{ width: "100%", height: 520, border: 0, borderRadius: token.borderRadius }}
                    />
                  ) : (
                    <Flex vertical align="center" justify="center" style={{ minHeight: 520, textAlign: "center" }}>
                      <Typography.Text type="secondary">
                        Preview not available for this file type. Use the link below to open it.
                      </Typography.Text>
                      <Typography.Link href={fileUrl} target="_blank" rel="noreferrer">
                        Open file
                      </Typography.Link>
                    </Flex>
                  )}
                </div>

                <Descriptions size="small" column={1} bordered style={{ marginBottom: token.marginMD }}>
                  <Descriptions.Item label="File">{doc.originalName}</Descriptions.Item>
                  <Descriptions.Item label="Content type">{doc.contentType}</Descriptions.Item>
                  <Descriptions.Item label="Size (bytes)">{doc.sizeBytes}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} lg={13}>
              <Card title="Extracted insights" style={{ marginBottom: token.marginLG }}>
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  Normal preview (OCR text)
                </Typography.Title>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                    maxHeight: 260,
                    overflow: "auto",
                    padding: token.paddingSM,
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadius,
                  }}
                >
                  {doc.extractedText || "(empty)"}
                </pre>

                {doc.keyValuePairs.length > 0 ? (
                  <>
                    <Typography.Title level={5}>Detected key / value pairs</Typography.Title>
                    <Descriptions size="small" column={1} bordered>
                      {doc.keyValuePairs.slice(0, 40).map((kv, i) => (
                        <Descriptions.Item key={`${kv.key}-${i}`} label={kv.key}>
                          {kv.value || "—"}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </>
                ) : (
                  <Typography.Text type="secondary">No key-value pairs detected for this document.</Typography.Text>
                )}

                {doc.tablesPreview ? (
                  <>
                    <Typography.Title level={5} style={{ marginTop: token.marginMD }}>
                      Tables preview
                    </Typography.Title>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        fontSize: 12,
                        maxHeight: 220,
                        overflow: "auto",
                        padding: token.paddingSM,
                        background: token.colorFillAlter,
                        borderRadius: token.borderRadius,
                      }}
                    >
                      {doc.tablesPreview}
                    </pre>
                  </>
                ) : null}
              </Card>

              <Card title="Chat with this document">
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: "auto",
                      padding: token.paddingSM,
                      background: token.colorFillAlter,
                      borderRadius: token.borderRadius,
                    }}
                  >
                    {chatLog.length === 0 ? (
                      <Typography.Text type="secondary">Ask a question about the document content.</Typography.Text>
                    ) : (
                      chatLog.map((m, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <Typography.Text strong>{m.role === "user" ? "You" : "DocLens"}:</Typography.Text>{" "}
                          <Typography.Text>{m.text}</Typography.Text>
                        </div>
                      ))
                    )}
                  </div>
                  <Input.TextArea
                    rows={3}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder='e.g. "What is the total on this invoice?"'
                    disabled={chatLoading}
                  />
                  <Flex justify="flex-end">
                    <Button
                      type="primary"
                      loading={chatLoading}
                      disabled={!chatInput.trim()}
                      onClick={async () => {
                        const q = chatInput.trim();
                        if (!id || !q) return;
                        setChatInput("");
                        setChatLog((prev) => [...prev, { role: "user", text: q }]);
                        try {
                          const { reply } = await sendChat({ id, message: q }).unwrap();
                          setChatLog((prev) => [...prev, { role: "assistant", text: reply }]);
                        } catch (err) {
                          setChatLog((prev) => [
                            ...prev,
                            { role: "assistant", text: getApiErrorMessage(err, "Chat failed.") },
                          ]);
                        }
                      }}
                    >
                      Send
                    </Button>
                  </Flex>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
}
