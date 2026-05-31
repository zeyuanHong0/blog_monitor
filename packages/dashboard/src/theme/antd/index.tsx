import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";

type Props = {
  children: React.ReactNode;
};
export default function AntdConfig({ children }: Props) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorBgLayout: "#ffffff",
        },
        components: {
          Menu: {
            itemSelectedBg: "rgba(0, 0, 0, 0.06)",
            itemSelectedColor: "rgba(0, 0, 0, 0.88)",
            subMenuItemSelectedColor: "rgba(0, 0, 0, 0.88)",
            itemHoverBg: "rgba(0, 0, 0, 0.04)",
            itemHoverColor: "rgba(0, 0, 0, 0.88)",
            itemActiveBg: "rgba(0, 0, 0, 0.08)",
            itemBorderRadius: 6,
            itemMarginInline: 8,
          },
        },
      }}
    >
      {/* https://ant.design/docs/react/compatible-style-cn#styleprovider */}
      <StyleProvider hashPriority="high">{children}</StyleProvider>
    </ConfigProvider>
  );
}
