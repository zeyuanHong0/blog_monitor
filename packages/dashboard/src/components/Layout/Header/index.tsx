import { Breadcrumb, Button, Flex, Grid, Layout, theme } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";

import useSettingsStore from "@/store/settingsStore";

const { Header: AntHeader } = Layout;

const ROUTE_LABELS: Record<string, string> = {
  "/overview": "概览",
  "/traffic": "流量分析",
  "/performance": "性能监控",
  "/errors": "错误追踪",
  "/uptime": "可用性",
};

export default function Header() {
  const setSidebarCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);
  const location = useLocation();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const firstSegment = "/" + location.pathname.split("/").filter(Boolean)[0];
  const currentLabel = ROUTE_LABELS[firstSegment];

  const breadcrumbItems = [
    { title: "Blog Monitor" },
    ...(currentLabel ? [{ title: currentLabel }] : []),
  ];

  return (
    <AntHeader
      style={{
        background: "transparent",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: `0 ${token.paddingLG}px`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Flex align="center" flex={1} style={{ minWidth: 0 }}>
        {isMobile && (
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setSidebarCollapsed(true)}
            style={{ marginRight: token.marginSM }}
          />
        )}
        <Breadcrumb items={breadcrumbItems} />
      </Flex>
    </AntHeader>
  );
}
