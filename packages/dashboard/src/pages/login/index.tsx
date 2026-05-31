import styles from "./index.module.scss";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Checkbox, Form, Input, message } from "antd";

import { AuroraBackground } from "@/components/AuroraBackground";
import useUserStore from "@/store/userStore";
import { useThemeToken } from "@/theme/hooks";
import { APP_LOGO, APP_NAME } from "@/constants";

type FieldType = {
  username: string;
  password: string;
  remember: boolean;
};

const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { userLogin, getUserInfo } = useUserStore();
  const navigate = useNavigate();
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
  const onFinish = async (values: FieldType) => {
    try {
      await userLogin(values);
      await getUserInfo();
      navigate("/", { replace: true });
    } catch (err: any) {
      messageApi.error(err.message || "登录失败，请检查用户名和密码");
    }
  };

  return (
    <>
      {contextHolder}
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
    </>
  );
};

export default Login;
