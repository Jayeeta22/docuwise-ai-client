import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import type { AuthUser } from "../types/auth";

type DashboardPageProps = {
  user: AuthUser;
};

export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <section className="card">
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        Dashboard
      </Typography.Title>
      <Typography.Paragraph>Signed in as {user.email}</Typography.Paragraph>
      <Typography.Paragraph>
        Upload PDFs or images, review Azure Document Intelligence extraction (layout + key-value pairs), and chat
        with your files using Azure OpenAI—all from the Documents workspace.
      </Typography.Paragraph>
      <Link to="/documents">
        <Button type="primary" size="large">
          Go to Documents
        </Button>
      </Link>
    </section>
  );
}
