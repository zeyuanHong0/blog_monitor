import styles from "./index.module.scss";
import type { CSSProperties } from "react";
import type { FormProps } from "antd";
import { Card, Button, Checkbox, Form, Input } from "antd";

import { AuroraBackground } from "@/components/AuroraBackground";
import { useThemeToken } from "@/theme/hooks";
import { APP_LOGO, APP_NAME } from "@/constants";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const Login = () => {
  const token = useThemeToken();
  const glassMix = "42%";
  const backdrop = "blur(18px) saturate(1.35)";
  const cardStyle: CSSProperties = {
    width: 384,
    maxWidth: "100%",
    borderRadius: token.borderRadiusLG,
    background: `color-mix(in srgb, ${token.colorBgContainer} ${glassMix}, transparent)`,
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    borderColor: token.colorBorderSecondary,
    boxShadow: token.boxShadow,
    ["--login-card-fallback-bg" as string]: token.colorBgElevated,
  };
  return (
    <AuroraBackground className={styles.loginContainer}>
      <Card
        className="login-page__card"
        style={cardStyle}
        styles={{
          body: { padding: token.paddingLG, background: "transparent" },
        }}
      >
        <div className={styles.loginHeader}>
          <img src={APP_LOGO} alt={APP_NAME} />
          <h1>{APP_NAME}</h1>
        </div>
        <Form
          name="basic"
          layout="vertical"
          requiredMark={false}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item<FieldType>
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>

          <Form.Item<FieldType>
            name="remember"
            valuePropName="checked"
            label={null}
          >
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AuroraBackground>
  );
};

export default Login;
