import { LockOutlined, MailOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Grid,
  Input,
  Row,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegisterMutation } from "../store/apiSlice";
import { getApiErrorMessage } from "../utils/rtkError";

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterPage() {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm<RegisterFormValues>();
  const [register, { isLoading }] = useRegisterMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <Row wrap={false} style={{ minHeight: "100vh" }}>
      <Col
        xs={0}
        md={12}
        style={{
          background: `linear-gradient(160deg, #0f172a 0%, ${token.colorPrimary} 50%, #020617 100%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: token.paddingXL * 2,
        }}
      >
        <Typography.Title level={2} style={{ color: "#fff", margin: 0, maxWidth: 420 }}>
          Create your DocLens AI account
        </Typography.Title>
        <Typography.Paragraph
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: token.fontSizeLG,
            marginTop: token.marginMD,
            marginBottom: 0,
            maxWidth: 400,
          }}
        >
          Get started with secure sign-in, then upload documents and explore AI-powered insights.
        </Typography.Paragraph>
      </Col>

      <Col
        xs={24}
        md={12}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: token.paddingLG,
          background: token.colorBgLayout,
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {!screens.md ? (
            <div
              style={{
                marginBottom: token.marginLG,
                padding: `${token.paddingMD}px ${token.padding}px`,
                borderRadius: token.borderRadiusLG,
                textAlign: "center",
                background: `linear-gradient(135deg, #0f172a 0%, ${token.colorPrimary} 100%)`,
              }}
            >
              <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
                DocLens AI
              </Typography.Title>
            </div>
          ) : null}
          <div style={{ marginBottom: token.marginLG, textAlign: "center" }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Create account
            </Typography.Title>
            <Typography.Text type="secondary">Choose an email and a strong password.</Typography.Text>
          </div>

          <Card bordered={false} styles={{ body: { padding: token.paddingLG } }}>
            <Form<RegisterFormValues>
              form={form}
              layout="vertical"
              requiredMark="optional"
              onValuesChange={() => {
                if (submitError) setSubmitError(null);
              }}
              onFinish={async ({ email, password }) => {
                setSubmitError(null);
                try {
                  await register({
                    email: email.trim(),
                    password,
                  }).unwrap();
                } catch (error: unknown) {
                  setSubmitError(
                    getApiErrorMessage(
                      error,
                      "Registration failed. Try a different email or check your connection.",
                    ),
                  );
                }
              }}
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Enter your email address." },
                  { type: "email", message: "Enter a valid email address." },
                ]}
                hasFeedback
              >
                <Input
                  size="large"
                  prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />}
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Choose a password." },
                  { min: 6, message: "Password must be at least 6 characters." },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="Confirm password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm your password." },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match."));
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </Form.Item>

              {submitError ? (
                <Alert
                  role="alert"
                  type="error"
                  showIcon
                  message={submitError}
                  style={{ marginBottom: token.marginMD }}
                />
              ) : null}

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                  Create account
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Divider plain>
            <Typography.Text type="secondary">Already have an account?</Typography.Text>
          </Divider>
          <Typography.Paragraph style={{ textAlign: "center", margin: 0 }}>
            <Link to="/login" style={{ color: token.colorLink, fontWeight: 500 }}>
              Sign in
            </Link>
          </Typography.Paragraph>
          <Typography.Paragraph style={{ textAlign: "center", marginTop: token.marginSM }}>
            <Link to="/" style={{ color: token.colorTextSecondary }}>
              ← Back to home
            </Link>
          </Typography.Paragraph>
        </div>
      </Col>
    </Row>
  );
}
