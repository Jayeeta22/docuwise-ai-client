import { Alert, Card, Col, Empty, Flex, Popconfirm, Row, Spin, Table, Typography, Upload, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useDeleteDocumentMutation, useGetDocumentsQuery, useUploadDocumentMutation } from "../store/apiSlice";
import type { DocumentCategory, DocumentListItem } from "../types/document";
import { getApiErrorMessage } from "../utils/rtkError";

export function DocumentsPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { t } = useI18n();

  const { data: resumeData, isLoading: resumeLoading, error: resumeError } = useGetDocumentsQuery({
    category: "resume",
  });
  const { data: invoiceData, isLoading: invoiceLoading, error: invoiceError } = useGetDocumentsQuery({
    category: "invoice",
  });
  const { data: receiptData, isLoading: receiptLoading, error: receiptError } = useGetDocumentsQuery({
    category: "receipt",
  });
  const { data: generalData, isLoading: generalLoading, error: generalError } = useGetDocumentsQuery({
    category: "general",
  });

  const [uploadDoc] = useUploadDocumentMutation();
  const [deleteDoc, { isLoading: deleting }] = useDeleteDocumentMutation();

  const resumeDocuments = resumeData?.documents ?? [];
  const invoiceDocuments = invoiceData?.documents ?? [];
  const receiptDocuments = receiptData?.documents ?? [];
  const generalDocuments = generalData?.documents ?? [];

  const allDocuments: DocumentListItem[] = [...resumeDocuments, ...invoiceDocuments, ...receiptDocuments, ...generalDocuments];
  const tableLoading = resumeLoading || invoiceLoading || receiptLoading || generalLoading;

  const [uploadingByCategory, setUploadingByCategory] = useState<Record<DocumentCategory, boolean>>({
    resume: false,
    invoice: false,
    receipt: false,
    general: false,
  });

  const columns: ColumnsType<DocumentListItem> = useMemo(
    () => [
      {
        title: "Type",
        dataIndex: "category",
        width: 140,
        render: (cat: string) => {
          if (cat === "resume") return "Resume";
          if (cat === "invoice") return "Invoice";
          if (cat === "receipt") return "Receipt";
          return "General";
        },
      },
      { title: "File", dataIndex: "originalName", ellipsis: true },
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
        render: (_, row) => <Typography.Link onClick={() => navigate(`/documents/${row.id}`)}>Open</Typography.Link>,
      },
      {
        title: "",
        key: "delete",
        width: 120,
        render: (_, row) => (
          <Popconfirm
            title="Delete this document?"
            description="This will remove the file and extracted data."
            okText="Delete"
            okButtonProps={{ danger: true, loading: deleting }}
            onConfirm={async () => {
              await deleteDoc(row.id).unwrap();
            }}
          >
            <Typography.Link
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{ color: "#dc2626" }}
            >
              Delete
            </Typography.Link>
          </Popconfirm>
        ),
      },
    ],
    [navigate, deleteDoc, deleting],
  );

  const pipelineError = resumeError
    ? getApiErrorMessage(resumeError, "Could not load resume documents.")
    : invoiceError
      ? getApiErrorMessage(invoiceError, "Could not load invoice documents.")
      : receiptError
        ? getApiErrorMessage(receiptError, "Could not load receipt documents.")
      : generalError
        ? getApiErrorMessage(generalError, "Could not load documents.")
        : null;

  const renderUploadCard = (category: DocumentCategory, title: string, description: string) => (
    <Card title={title} styles={{ body: { padding: token.paddingLG } }}>
      <Upload.Dragger
        name="file"
        multiple
        accept=".pdf,image/png,image/jpeg,image/webp"
        showUploadList={false}
        disabled={uploadingByCategory[category]}
        customRequest={async ({ file, onError, onSuccess }) => {
          const fd = new FormData();
          fd.append("file", file as File);
          fd.append("category", category);
          setUploadingByCategory((prev) => ({ ...prev, [category]: true }));
          try {
            await uploadDoc(fd).unwrap();
            onSuccess?.({}, new XMLHttpRequest());
          } catch (err) {
            onError?.(new Error(getApiErrorMessage(err, "Upload failed.")));
          } finally {
            setUploadingByCategory((prev) => ({ ...prev, [category]: false }));
          }
        }}
      >
        <p className="ant-upload-drag-icon" style={{ fontSize: 40 }}>
          📄
        </p>
        <p className="ant-upload-text">{description}</p>
        <p className="ant-upload-hint">{t("docs.uploadFormats")}</p>
      </Upload.Dragger>
      {uploadingByCategory[category] ? <Spin style={{ marginTop: token.marginMD }} /> : null}
    </Card>
  );

  return (
    <div>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={token.marginMD}
        style={{ marginBottom: token.marginLG }}
      >
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {t("docs.title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t("docs.subtitle")}
          </Typography.Text>
        </div>
        <Link to="/dashboard">← {t("nav.dashboard")}</Link>
      </Flex>

      {pipelineError ? (
        <Alert type="error" message={pipelineError} style={{ marginBottom: token.marginMD }} showIcon />
      ) : null}

      <Row gutter={[16, 16]} style={{ marginBottom: token.marginLG }}>
        <Col xs={24} md={8}>
          {renderUploadCard("resume", "Resume Upload", "Upload resumes for matching")}
        </Col>
        <Col xs={24} md={8}>
          {renderUploadCard("invoice", "Invoice Upload", "Upload invoices for analysis")}
        </Col>
        <Col xs={24} md={8}>
          {renderUploadCard("general", "General Upload", "Upload any document for summary + chat")}
        </Col>
      </Row>

      <Card>
        <Table<DocumentListItem>
          rowKey="id"
          size="small"
          loading={tableLoading}
          dataSource={allDocuments}
          columns={columns}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description={t("docs.noDocuments")} /> }}
          onRow={(row) => ({
            onClick: () => navigate(`/documents/${row.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
}

export default DocumentsPage;
