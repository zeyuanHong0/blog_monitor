import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Descriptions, Spin, Result, Button, Tag, theme } from "antd";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

import { getErrorDetail } from "@/api/errors";
import type { ErrorDetail } from "@/api/errors/types";

import styles from "./detail.module.scss";

const errorTypeMap: Record<string, { color: string; label: string }> = {
  js: { color: "red", label: "JS" },
  promise: { color: "orange", label: "Promise" },
  resource: { color: "green", label: "资源" },
  ajax: { color: "blue", label: "Ajax" },
  network: { color: "purple", label: "网络" },
  framework: { color: "cyan", label: "框架" },
  custom: { color: "geekblue", label: "自定义" },
  unknown: { color: "default", label: "未知" },
};

const ErrorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setFetchError(false);
    getErrorDetail(id)
      .then((res) => {
        if (cancelled) return;
        setErrorDetail(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <Result
        status="error"
        title="参数错误"
        subTitle="缺少错误 ID"
        extra={
          <Button onClick={() => navigate("/errors")}>返回错误列表</Button>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Spin size="large" style={{ display: "block", marginTop: 120 }} />
      </div>
    );
  }

  if (fetchError || !errorDetail) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle="获取错误详情失败，请稍后重试"
        extra={
          <Button onClick={() => navigate("/errors", { replace: true })}>
            返回错误列表
          </Button>
        }
      />
    );
  }

  const typeInfo = errorTypeMap[errorDetail.errorType] ?? {
    color: "default",
    label: errorDetail.errorType,
  };

  const framework = errorDetail.framework;
  const isFrameworkError = errorDetail.errorType === "framework" && framework;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span
          className={styles.backBtn}
          onClick={() => navigate("/errors", { replace: true })}
        >
          <ArrowLeft size={20} color={token.colorText} />
        </span>
        <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
      </div>

      <div className={styles.message} style={{ color: token.colorText }}>
        {errorDetail.message}
      </div>

      {isFrameworkError && (
        <div className={styles.section}>
          <div
            className={styles.sectionTitle}
            style={{ color: token.colorText }}
          >
            框架信息
          </div>
          <div
            className={styles.contextCard}
            style={{
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="框架">
                {framework.name === "react" ? "React" : "Vue"}
              </Descriptions.Item>
              {framework.componentName && (
                <Descriptions.Item label="组件名称">
                  {framework.componentName}
                </Descriptions.Item>
              )}
              {framework.hook && (
                <Descriptions.Item label="Hook">
                  {framework.hook}
                </Descriptions.Item>
              )}
              {framework.componentStack && (
                <Descriptions.Item label="组件堆栈">
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {framework.componentStack}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle} style={{ color: token.colorText }}>
          堆栈信息
        </div>
        <div
          className={styles.stackBlock}
          style={{ backgroundColor: token.colorFillQuaternary }}
        >
          {errorDetail.stack ? (
            <pre>
              <code style={{ color: token.colorText }}>
                {errorDetail.stack}
              </code>
            </pre>
          ) : (
            <span style={{ color: token.colorTextSecondary }}>无堆栈信息</span>
          )}
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
              {errorDetail.url}
            </Descriptions.Item>
            {errorDetail.filename && (
              <Descriptions.Item label="文件名">
                {errorDetail.filename}
              </Descriptions.Item>
            )}
            {errorDetail.lineno != null && (
              <Descriptions.Item label="行号">
                {errorDetail.lineno}
              </Descriptions.Item>
            )}
            {errorDetail.colno != null && (
              <Descriptions.Item label="列号">
                {errorDetail.colno}
              </Descriptions.Item>
            )}
            {errorDetail.resourceUrl && (
              <Descriptions.Item label="资源地址">
                {errorDetail.resourceUrl}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="发生时间">
              {dayjs(errorDetail.createTime).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetail;
