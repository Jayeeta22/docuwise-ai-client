import { Alert, Button, Card, Col, Descriptions, Empty, Flex, Input, Popconfirm, Row, Select, Space, Spin, Typography, theme } from "antd";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import { useChatDocumentMutation, useDeleteDocumentMutation, useGetChatUsageQuery, useGetDocumentQuery, useTranslateDocumentMutation } from "../store/apiSlice";
import { getApiBaseUrl } from "../lib/apiBase";
import { getApiErrorMessage } from "../utils/rtkError";

type ChatTurn = { role: "user" | "assistant"; text: string };

export function DocumentDetailPage() {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatTurn[]>([]);
  const [replyLanguage, setReplyLanguage] = useState("English");
  const [previewLanguage, setPreviewLanguage] = useState("English");
  const [translatedPreview, setTranslatedPreview] = useState<{ extractedText: string; tablesPreview: string } | null>(null);
  const [translationError, setTranslationError] = useState("");

  const { data, isFetching, error } = useGetDocumentQuery(id, { skip: !id });
  const { data: usage, refetch: refetchUsage } = useGetChatUsageQuery();
  const [sendChat, { isLoading: chatLoading }] = useChatDocumentMutation();
  const [deleteDoc, { isLoading: deleting }] = useDeleteDocumentMutation();
  const [translateDoc, { isLoading: translating }] = useTranslateDocumentMutation();

  const doc = data?.document;
  const fileUrl = id ? `${getApiBaseUrl()}/documents/${encodeURIComponent(id)}/file` : "";
  const detailError = error ? getApiErrorMessage(error, "Could not load document details.") : null;

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginMD} style={{ marginBottom: token.marginLG }}>
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {doc?.originalName ?? t("doc.details")}
          </Typography.Title>
          <Typography.Text type="secondary">{t("doc.reviewAndChat")}</Typography.Text>
        </div>
        <Space>
          <Link to="/dashboard">{t("nav.dashboard")}</Link>
          <Popconfirm
            title="Delete this document?"
            description="This permanently removes file and extracted data."
            okText="Delete"
            okButtonProps={{ danger: true, loading: deleting }}
            onConfirm={async () => {
              if (!id) return;
              await deleteDoc(id).unwrap();
              navigate("/documents");
            }}
          >
            <Button danger loading={deleting}>Delete</Button>
          </Popconfirm>
          <Button onClick={() => navigate("/documents")}>{t("doc.backToDocuments")}</Button>
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
              <Card title={t("doc.preview")}>
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
              <Card title={t("doc.extractedInsights")} style={{ marginBottom: token.marginLG }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
                  <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
                    {t("doc.ocrPreview")}
                  </Typography.Title>
                  <Select
                    value={previewLanguage}
                    onChange={async (nextLanguage) => {
                      setPreviewLanguage(nextLanguage);
                      setTranslationError("");
                      if (nextLanguage === "English") {
                        setTranslatedPreview(null);
                        return;
                      }
                      if (!id) return;
                      try {
                        const result = await translateDoc({ id, targetLanguage: nextLanguage }).unwrap();
                        setTranslatedPreview({
                          extractedText: result.translatedExtractedText,
                          tablesPreview: result.translatedTablesPreview,
                        });
                      } catch (err) {
                        setTranslatedPreview(null);
                        setTranslationError(getApiErrorMessage(err, "Translation failed."));
                      }
                    }}
                    options={[
                      { value: "English", label: "English" },
                      { value: "Bengali", label: "Bengali" },
                      { value: "Spanish", label: "Spanish" },
                    ]}
                    loading={translating}
                    style={{ minWidth: 160 }}
                  />
                </Flex>
                {translationError ? (
                  <Alert showIcon type="warning" message={translationError} style={{ marginTop: token.marginSM }} />
                ) : null}
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
                  {previewLanguage === "English"
                    ? doc.extractedText || "(empty)"
                    : translatedPreview?.extractedText || "(translating...)"}
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
                  <Typography.Text type="secondary">{t("doc.noKeyValue")}</Typography.Text>
                )}

                {doc.detectedLanguage || doc.keyPhrases?.length > 0 || doc.entities?.length > 0 ? (
                  <>
                    <Typography.Title level={5} style={{ marginTop: token.marginMD }}>
                      Language insights
                    </Typography.Title>
                    <Descriptions size="small" column={1} bordered style={{ marginBottom: token.marginMD }}>
                      <Descriptions.Item label="Detected language">
                        {doc.detectedLanguage || "(not available)"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Key phrases">
                        {doc.keyPhrases.length ? doc.keyPhrases.slice(0, 15).join(", ") : "(none)"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Entities">
                        {doc.entities.length
                          ? doc.entities
                              .slice(0, 12)
                              .map((e) => `${e.text} [${e.category}]`)
                              .join(", ")
                          : "(none)"}
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                ) : null}

                {doc.tablesPreview ? (
                  <>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
                      <Typography.Title level={5} style={{ marginTop: token.marginMD, marginBottom: 0 }}>
                        {t("doc.tablesPreview")}
                      </Typography.Title>
                      <Select
                        value={previewLanguage}
                        onChange={async (nextLanguage) => {
                          setPreviewLanguage(nextLanguage);
                          setTranslationError("");
                          if (nextLanguage === "English") {
                            setTranslatedPreview(null);
                            return;
                          }
                          if (!id) return;
                          try {
                            const result = await translateDoc({ id, targetLanguage: nextLanguage }).unwrap();
                            setTranslatedPreview({
                              extractedText: result.translatedExtractedText,
                              tablesPreview: result.translatedTablesPreview,
                            });
                          } catch (err) {
                            setTranslatedPreview(null);
                            setTranslationError(getApiErrorMessage(err, "Translation failed."));
                          }
                        }}
                        options={[
                          { value: "English", label: "English" },
                          { value: "Bengali", label: "Bengali" },
                          { value: "Spanish", label: "Spanish" },
                        ]}
                        loading={translating}
                        style={{ minWidth: 160, marginTop: token.marginMD }}
                      />
                    </Flex>
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
                      {previewLanguage === "English"
                        ? doc.tablesPreview
                        : translatedPreview?.tablesPreview || "(translating...)"}
                    </pre>
                  </>
                ) : null}
              </Card>

              <Card title={t("doc.chatTitle")}>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
                    <Select
                      value={replyLanguage}
                      onChange={setReplyLanguage}
                      options={[
                        { value: "English", label: "Reply in English" },
                        { value: "Bengali", label: "Reply in Bengali" },
                      ]}
                      style={{ minWidth: 200 }}
                    />
                    <Typography.Text type={usage && usage.remaining <= 3 ? "warning" : "secondary"}>
                      {usage ? `Chats left this month: ${usage.remaining}/${usage.limit}` : "Loading chat quota..."}
                    </Typography.Text>
                  </Flex>

                  {usage && usage.remaining <= 0 ? (
                    <Alert
                      type="warning"
                      showIcon
                      message="For your project, monthly chat limit exceeded."
                    />
                  ) : null}

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
                      <Typography.Text type="secondary">{t("doc.askHint")}</Typography.Text>
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
                    disabled={chatLoading || Boolean(usage && usage.remaining <= 0)}
                  />
                  <Flex justify="flex-end">
                    <Button
                      type="primary"
                      loading={chatLoading}
                      disabled={!chatInput.trim() || Boolean(usage && usage.remaining <= 0)}
                      onClick={async () => {
                        const q = chatInput.trim();
                        if (!id || !q) return;
                        setChatInput("");
                        setChatLog((prev) => [...prev, { role: "user", text: q }]);
                        try {
                          const { reply } = await sendChat({ id, message: q, replyLanguage }).unwrap();
                          setChatLog((prev) => [...prev, { role: "assistant", text: reply }]);
                          void refetchUsage();
                        } catch (err) {
                          setChatLog((prev) => [
                            ...prev,
                            { role: "assistant", text: getApiErrorMessage(err, "Chat failed.") },
                          ]);
                        }
                      }}
                    >
                      {t("doc.send")}
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
