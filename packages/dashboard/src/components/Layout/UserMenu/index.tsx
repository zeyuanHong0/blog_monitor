import { Avatar, Button, Dropdown, Flex, theme } from "antd";
import { EllipsisOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

import useUserStore from "@/store/userStore";
import styles from "./index.module.scss";

type Props = {
  collapsed: boolean;
};

export default function UserMenu({ collapsed }: Props) {
  const userInfo = useUserStore((s) => s.userInfo);
  const userLogout = useUserStore((s) => s.userLogout);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const dropdownItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: async () => {
        await userLogout();
        navigate("/login", { replace: true });
      },
    },
  ];

  const avatar = <Avatar size={32} icon={<UserOutlined />} />;

  if (collapsed) {
    return (
      <Dropdown
        menu={{ items: dropdownItems }}
        placement="topRight"
        trigger={["click"]}
      >
        <div
          className={styles.collapsedTrigger}
          style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
        >
          {avatar}
        </div>
      </Dropdown>
    );
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      className={styles.userMenu}
      style={{
        padding: token.paddingSM,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Flex
        align="center"
        gap={token.marginSM}
        style={{ minWidth: 0, overflow: "hidden" }}
      >
        {avatar}
        <span className={styles.username} style={{ fontSize: token.fontSize }}>
          {userInfo?.username || "用户"}
        </span>
      </Flex>
      <Dropdown
        menu={{ items: dropdownItems }}
        placement="topRight"
        trigger={["click"]}
      >
        <Button type="text" size="small" icon={<EllipsisOutlined />} />
      </Dropdown>
    </Flex>
  );
}
