import { useNavigate, useParams } from "react-router-dom";
import { Descriptions, Tag, theme } from "antd";
import { ArrowLeft } from "lucide-react";

import styles from "./detail.module.scss";

const errorTypeMap: Record<
  string,
  { color: string; label: string }
> = {
  js: { color: "red", label: "JS 错误" },
  promise: { color: "orange", label: "Promise 错误" },
  resource: { color: "green", label: "资源加载错误" },
  ajax: { color: "blue", label: "Ajax 错误" },
  network: { color: "purple", label: "网络错误" },
  framework: { color: "cyan", label: "框架错误" },
};

const mockErrorDetail = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  appId: "blog-app",
  errorType: "js",
  message: "Cannot read properties of undefined (reading 'map')",
  stack: `TypeError: Cannot read properties of undefined (reading 'map')
    at PostList (webpack:///src/components/PostList.tsx:24:18)
    at renderWithHooks (webpack:///node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (webpack:///node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (webpack:///node_modules/react-dom/cjs/react-dom.development.js:19049:16)
    at HTMLUnknownElement.callCallback (webpack:///node_modules/react-dom/cjs/react-dom.development.js:3945:14)`,
  filename: "assets/index-a1b2c3d4.js",
  lineno: 1234,
  colno: 56,
  resourceUrl: null,
  url: "/posts/react-hooks-guide",
  sessionId: "sess_abc123def456",
  createTime: "2026-06-07 14:32:18",
};

const ErrorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // TODO: 接入 API 后根据 id 请求真实数据
  const detail = mockErrorDetail;
  const typeInfo = errorTypeMap[detail.errorType] ?? {
    color: "default",
    label: detail.errorType,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span
          className={styles.backBtn}
          onClick={() => navigate("/errors")}
        >
          <ArrowLeft size={20} color={token.colorText} />
        </span>
        <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
      </div>

      <div className={styles.message} style={{ color: token.colorText }}>
        {detail.message}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle} style={{ color: token.colorText }}>
          堆栈信息
        </div>
        <div
          className={styles.stackBlock}
          style={{ backgroundColor: token.colorFillQuaternary }}
        >
          <pre>
            <code style={{ color: token.colorText }}>{detail.stack}</code>
          </pre>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle} style={{ color: token.colorText }}>
          上下文信息
        </div>
        <div
          className={styles.contextCard}
          style={{
            backgroundColor: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="页面 URL">
              {detail.url}
            </Descriptions.Item>
            <Descriptions.Item label="文件名">
              {detail.filename}
            </Descriptions.Item>
            <Descriptions.Item label="行号">
              {detail.lineno}
            </Descriptions.Item>
            <Descriptions.Item label="列号">
              {detail.colno}
            </Descriptions.Item>
            {detail.errorType === "resource" && (
              <Descriptions.Item label="资源地址">
                {detail.resourceUrl ?? "-"}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="发生时间">
              {detail.createTime}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetail;
