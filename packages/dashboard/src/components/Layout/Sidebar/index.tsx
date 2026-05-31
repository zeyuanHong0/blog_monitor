import { Button, Drawer, Flex, Grid, Layout, Menu, theme } from "antd";
import { useEffect } from "react";
import {
  PanelLeft,
  LayoutDashboard,
  TrendingUp,
  Zap,
  Bug,
  Activity,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

import { APP_LOGO, APP_NAME } from "@/constants";
import useSettingsStore from "@/store/settingsStore";
import UserMenu from "../UserMenu";
import styles from "./index.module.scss";

const { Sider } = Layout;

const ICON_SIZE = 16;

const NAV_ITEMS: MenuProps["items"] = [
  {
    key: "/overview",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    label: "概览",
  },
  { key: "/traffic", icon: <TrendingUp size={ICON_SIZE} />, label: "流量分析" },
  { key: "/performance", icon: <Zap size={ICON_SIZE} />, label: "性能监控" },
  { key: "/errors", icon: <Bug size={ICON_SIZE} />, label: "错误追踪" },
  { key: "/uptime", icon: <Activity size={ICON_SIZE} />, label: "可用性" },
];

export default function Sidebar() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  // 切换到移动端时重置折叠状态（关闭 Drawer）
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, setSidebarCollapsed]);

  const selectedKey = "/" + location.pathname.split("/").filter(Boolean)[0];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
    if (isMobile) setSidebarCollapsed(false);
  };

  const expandedBrand = (omitToggle = false) => (
    <Flex
      align="center"
      gap={token.marginSM}
      className={styles.brand}
      style={{ padding: `${token.paddingSM}px ${token.paddingSM}px` }}
    >
      <img
        src={APP_LOGO}
        alt="logo"
        width={42}
        height={42}
        style={{
          borderRadius: token.borderRadius,
          display: "block",
          flexShrink: 0,
        }}
      />
      <span className={styles.brandName} style={{ fontSize: token.fontSizeLG }}>
        {APP_NAME}
      </span>
      {!omitToggle && (
        <Button
          type="text"
          size="small"
          icon={<PanelLeft size={token.fontSize} />}
          onClick={toggleSidebar}
          aria-label="折叠侧边栏"
          style={{ marginLeft: "auto", flexShrink: 0 }}
        />
      )}
    </Flex>
  );

  /** hover 显示展开按钮 */
  const collapsedBrand = () => (
    <Flex
      justify="center"
      style={{ padding: `${token.paddingSM}px ${token.paddingXXS}px` }}
    >
      <div className={styles.collapsedBrand}>
        <div className={styles.collapsedBrandLogo}>
          <img
            src={APP_LOGO}
            alt="logo"
            width={42}
            height={42}
            style={{ borderRadius: token.borderRadius, display: "block" }}
          />
        </div>
        <div className={styles.collapsedBrandToggle}>
          <Button
            type="text"
            size="small"
            icon={<PanelLeft size={token.fontSize} />}
            onClick={toggleSidebar}
            aria-label="展开侧边栏"
            className={styles.collapsedBrandBtn}
          />
        </div>
      </div>
    </Flex>
  );

  const menuNode = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      inlineCollapsed={!isMobile && collapsed}
      items={NAV_ITEMS}
      onClick={handleMenuClick}
      style={{
        marginTop: token.margin,
        borderRight: "none",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        background: "transparent",
      }}
    />
  );

  const sidebarContent = (isCollapsed: boolean, omitToggle = false) => (
    <Flex vertical style={{ height: "100%" }}>
      {isCollapsed ? collapsedBrand() : expandedBrand(omitToggle)}
      {menuNode}
      <UserMenu collapsed={isCollapsed} />
    </Flex>
  );

  // 移动端：Drawer
  if (isMobile) {
    return (
      <Drawer
        open={collapsed}
        placement="left"
        onClose={() => setSidebarCollapsed(false)}
        width={280}
        styles={{
          body: {
            padding: 0,
            background: token.colorBgLayout,
            overflow: "hidden",
          },
          header: { display: "none" },
        }}
      >
        {sidebarContent(false, true)}
      </Drawer>
    );
  }

  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      collapsedWidth={64}
      style={{
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgLayout,
        minHeight: "100vh",
        overflow: "visible",
      }}
    >
      {sidebarContent(collapsed)}
    </Sider>
  );
}
