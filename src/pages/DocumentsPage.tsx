import { Alert, Card, Empty, Flex, Spin, Table, Typography, Upload, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetDocumentsQuery, useUploadDocumentMutation } from "../store/apiSlice";
import type { DocumentListItem } from "../types/document";
import { getApiErrorMessage } from "../utils/rtkError";

export function DocumentsPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const { data: listData, isLoading: listLoading, error: listError } = useGetDocumentsQuery();
  const [uploadDoc, { isLoading: uploadLoading }] = useUploadDocumentMutation();
  const documents = listData?.documents ?? [];

  const columns: ColumnsType<DocumentListItem> = useMemo(
    () => [
      { title: "File", dataIndex: "originalName", ellipsis: true },
      { title: "Type", dataIndex: "contentType", width: 140 },
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
    ],
    [navigate],
  );

  const pipelineError = listError ? getApiErrorMessage(listError, "Could not load documents.") : null;

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
            Documents
          </Typography.Title>
          <Typography.Text type="secondary">
            Upload PDFs or images. Click a document row to open a dedicated detail page.
          </Typography.Text>
        </div>
        <Link to="/dashboard">← Dashboard</Link>
      </Flex>

      {pipelineError ? (
        <Alert type="error" message={pipelineError} style={{ marginBottom: token.marginMD }} showIcon />
      ) : null}

      <Card title="Upload" styles={{ body: { padding: token.paddingLG } }} style={{ marginBottom: token.marginLG }}>
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

      <Card title="Your uploads">
        <Table<DocumentListItem>
          rowKey="id"
          size="small"
          loading={listLoading}
          dataSource={documents}
          columns={columns}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="No documents yet" /> }}
          onRow={(row) => ({
            onClick: () => navigate(`/documents/${row.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
}
