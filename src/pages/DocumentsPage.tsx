import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  Input,
  Row,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useChatDocumentMutation,
  useGetDocumentQuery,
  useGetDocumentsQuery,
  useUploadDocumentMutation,
} from "../store/apiSlice";
import type { DocumentListItem } from "../types/document";
import { getApiErrorMessage } from "../utils/rtkError";

type ChatTurn = { role: "user" | "assistant"; text: string };

export function DocumentsPage() {
  const { token } = theme.useToken();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatTurn[]>([]);

  const { data: listData, isLoading: listLoading, error: listError } = useGetDocumentsQuery();
  const { data: detailData, isFetching: detailLoading } = useGetDocumentQuery(selectedId ?? "", {
    skip: !selectedId,
  });
  const [uploadDoc, { isLoading: uploadLoading }] = useUploadDocumentMutation();
  const [sendChat, { isLoading: chatLoading }] = useChatDocumentMutation();

  const documents = listData?.documents ?? [];

  useEffect(() => {
    setChatLog([]);
    setChatInput("");
  }, [selectedId]);

  const columns: ColumnsType<DocumentListItem> = useMemo(
    () => [
      {
        title: "File",
        dataIndex: "originalName",
        ellipsis: true,
      },
      {
        title: "Type",
        dataIndex: "contentType",
        width: 140,
      },
      {
        title: "Size",
        dataIndex: "sizeBytes",
        width: 100,
        render: (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`,
      },
      {
        title: "Uploaded",
        dataIndex: "createdAt",
        width: 200,
        render: (d: string) => new Date(d).toLocaleString(),
      },
      {
        title: "",
        key: "open",
        width: 100,
        render: (_, row) => (
          <Button type="link" onClick={() => setSelectedId(row.id)}>
            Open
          </Button>
        ),
      },
    ],
    [],
  );

  const pipelineError = listError ? getApiErrorMessage(listError, "Could not load documents.") : null;

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginMD} style={{ marginBottom: token.marginLG }}>
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Documents
          </Typography.Title>
          <Typography.Text type="secondary">
            Upload PDFs or images. Azure Document Intelligence extracts text and fields; chat uses Azure OpenAI.
          </Typography.Text>
        </div>
        <Link to="/dashboard">← Dashboard</Link>
      </Flex>

      {pipelineError ? (
        <Alert type="error" message={pipelineError} style={{ marginBottom: token.marginMD }} showIcon />
      ) : null}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card title="Upload" styles={{ body: { padding: token.paddingLG } }}>
            <Upload.Dragger
              name="file"
              multiple={false}
              accept=".pdf,image/png,image/jpeg,image/webp"
              showUploadList={false}
              disabled={uploadLoading}
              customRequest={async ({ file, onError, onSuccess }) => {
                const fd = new FormData();
                fd.append("file", file as File);
                try {
                  await uploadDoc(fd).unwrap();
                  onSuccess?.({}, new XMLHttpRequest());
                } catch (err) {
                  onError?.(new Error(getApiErrorMessage(err, "Upload failed.")));
                }
              }}
            >
              <p className="ant-upload-drag-icon" style={{ fontSize: 42 }}>
                📄
              </p>
              <p className="ant-upload-text">Click or drag file here</p>
              <p className="ant-upload-hint">PDF, PNG, JPEG, WebP — max 16 MB</p>
            </Upload.Dragger>
            {uploadLoading ? <Spin style={{ marginTop: token.marginMD }} /> : null}
          </Card>

          <Card title="Your uploads" style={{ marginTop: token.marginLG }}>
            <Table<DocumentListItem>
              rowKey="id"
              size="small"
              loading={listLoading}
              dataSource={documents}
              columns={columns}
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: <Empty description="No documents yet" /> }}
              onRow={(row) => ({
                onClick: () => setSelectedId(row.id),
                style: { cursor: "pointer" },
              })}
            />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          {!selectedId ? (
            <Card>
              <Empty description="Select a document from the list or click Open" />
            </Card>
          ) : (
            <Spin spinning={detailLoading}>
              <Card
                title={detailData?.document.originalName ?? "Document"}
                extra={
                  <Button type="link" onClick={() => { setSelectedId(null); setChatLog([]); }}>
                    Close
                  </Button>
                }
              >
                {detailData?.document ? (
                  <>
                    <Descriptions size="small" column={1} bordered style={{ marginBottom: token.marginMD }}>
                      <Descriptions.Item label="Content type">{detailData.document.contentType}</Descriptions.Item>
                      <Descriptions.Item label="Size (bytes)">{detailData.document.sizeBytes}</Descriptions.Item>
                    </Descriptions>

                    {detailData.document.keyValuePairs.length > 0 ? (
                      <>
                        <Typography.Title level={5}>Detected key / value pairs</Typography.Title>
                        <Descriptions size="small" column={1} bordered>
                          {detailData.document.keyValuePairs.slice(0, 40).map((kv, i) => (
                            <Descriptions.Item key={`${kv.key}-${i}`} label={kv.key}>
                              {kv.value || "—"}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      </>
                    ) : null}

                    {detailData.document.tablesPreview ? (
                      <>
                        <Typography.Title level={5} style={{ marginTop: token.marginMD }}>
                          Tables preview
                        </Typography.Title>
                        <Typography.Paragraph>
                          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, maxHeight: 200, overflow: "auto" }}>
                            {detailData.document.tablesPreview}
                          </pre>
                        </Typography.Paragraph>
                      </>
                    ) : null}

                    <Typography.Title level={5} style={{ marginTop: token.marginMD }}>
                      Extracted text
                    </Typography.Title>
                    <Typography.Paragraph>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: 12,
                          maxHeight: 280,
                          overflow: "auto",
                          padding: token.paddingSM,
                          background: token.colorFillAlter,
                          borderRadius: token.borderRadius,
                        }}
                      >
                        {detailData.document.extractedText || "(empty)"}
                      </pre>
                    </Typography.Paragraph>

                    <Typography.Title level={5}>Chat with this document</Typography.Title>
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
                            if (!selectedId || !q) return;
                            setChatInput("");
                            setChatLog((prev) => [...prev, { role: "user", text: q }]);
                            try {
                              const { reply } = await sendChat({ id: selectedId, message: q }).unwrap();
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
                  </>
                ) : null}
              </Card>
            </Spin>
          )}
        </Col>
      </Row>
    </div>
  );
}
