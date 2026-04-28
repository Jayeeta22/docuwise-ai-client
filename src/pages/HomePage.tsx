import type { CSSProperties } from "react";
import {
  BulbOutlined,
  FileSearchOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { Link } from "react-router-dom";
import { useGetMeQuery, useHealthQuery } from "../store/apiSlice";

export function HomePage() {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const { data: meData } = useGetMeQuery();
  const authUser = meData?.user ?? null;
  const { isLoading, isFetching, isError, isSuccess } = useHealthQuery();

  const healthPending = isLoading || isFetching;
  let healthLabel = "Checking API…";
  let healthStatus: "success" | "error" | "processing" = "processing";
  if (healthPending) {
    healthLabel = "Checking API…";
    healthStatus = "processing";
  } else if (isSuccess) {
    healthLabel = "API online";
    healthStatus = "success";
  } else if (isError) {
    healthLabel = "API offline";
    healthStatus = "error";
  }

  const featureCardStyle: CSSProperties = {
    height: "100%",
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowTertiary,
  };

  return (
    <div className="home-page">
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: token.borderRadiusLG * 1.5,
          padding: screens.md ? `${token.paddingXL * 1.25}px ${token.paddingXL * 1.5}px` : token.paddingLG,
          marginBottom: token.marginXL,
          background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorFillAlter} 45%, rgba(14, 165, 233, 0.06) 100%)`,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(600px 280px at 90% 10%, ${token.colorPrimary}22, transparent 55%)`,
            pointerEvents: "none",
          }}
        />
        <Flex vertical gap={token.marginLG} style={{ position: "relative" }}>
          <Flex wrap="wrap" align="center" justify="space-between" gap={token.marginMD}>
            <Tag color="processing" style={{ margin: 0, borderRadius: token.borderRadiusSM }}>
              Document intelligence
            </Tag>
            <Badge
              status={healthStatus}
              text={
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {healthPending ? (
                    <Space size={6}>
                      <LoadingOutlined />
                      {healthLabel}
                    </Space>
                  ) : (
                    healthLabel
                  )}
                </Typography.Text>
              }
            />
          </Flex>

          <div style={{ maxWidth: 640 }}>
            <Typography.Title
              level={1}
              style={{
                margin: 0,
                fontSize: screens.md ? 40 : 28,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              DocLens AI
            </Typography.Title>
            <Typography.Paragraph
              style={{
                marginTop: token.marginMD,
                marginBottom: 0,
                fontSize: screens.md ? token.fontSizeLG : token.fontSize,
                color: token.colorTextSecondary,
                maxWidth: 520,
              }}
            >
              Scan, read, and query your documents with AI—built for clear answers and a workflow you can grow into.
            </Typography.Paragraph>
          </div>

          <Space size="middle" wrap>
            {authUser ? (
              <Link to="/dashboard">
                <Button type="primary" size="large">
                  Open dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button type="primary" size="large">
                    Get started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="large">Sign in</Button>
                </Link>
              </>
            )}
          </Space>
        </Flex>
      </section>

      <Typography.Title level={4} style={{ marginBottom: token.marginMD }}>
        What you can do next
      </Typography.Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={featureCardStyle} styles={{ body: { padding: token.paddingLG } }}>
            <FileSearchOutlined
              style={{
                fontSize: 28,
                color: token.colorPrimary,
                marginBottom: token.marginSM,
              }}
            />
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Scan & ingest
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Bring PDFs and scans into one place so text and layout are ready for search and AI prompts.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={featureCardStyle} styles={{ body: { padding: token.paddingLG } }}>
            <BulbOutlined
              style={{
                fontSize: 28,
                color: token.colorPrimary,
                marginBottom: token.marginSM,
              }}
            />
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Ask your documents
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Ground answers in your files instead of generic chat—ideal for contracts, reports, and handbooks.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={featureCardStyle} styles={{ body: { padding: token.paddingLG } }}>
            <SafetyCertificateOutlined
              style={{
                fontSize: 28,
                color: token.colorPrimary,
                marginBottom: token.marginSM,
              }}
            />
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Secure foundation
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Session-based auth and a clean API layer—ready for uploads, lists, and viewers in the next milestone.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
