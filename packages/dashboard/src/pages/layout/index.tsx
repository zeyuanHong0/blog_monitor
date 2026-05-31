import { Flex, Layout, theme, Modal } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import useUserStore from "@/store/userStore";
import styles from "./index.module.scss";

const { Content } = Layout;
const { confirm } = Modal;

export default function MainLayout() {
  const { token } = theme.useToken();
  const { isLoginExpired, setLoginExpired } = useUserStore();
  const navigate = useNavigate();

  if (isLoginExpired) {
    confirm({
      title: "提示",
      content: "登录状态已过期，您可以停留在该页面或者重新登录",
      okText: "重新登录",
      cancelText: "取消",
      centered: true,
      onOk() {
        navigate("/login");
      },
      onCancel() {
        setLoginExpired(false);
      },
    });
  }

  return (
    <Layout className={styles.layout}>
      <Sidebar />
      <Flex vertical style={{ flex: 1, minWidth: 0, minHeight: "100vh" }}>
        <Header />
        <Content
          style={{
            flex: 1,
            padding: token.paddingLG,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Flex>
    </Layout>
  );
}
