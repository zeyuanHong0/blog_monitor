import { Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart } from "@/components/Charts";

// --- Mock: 错误趋势数据（最近 7 天） ---
const mockTrendData = {
  xData: ["06-01", "06-02", "06-03", "06-04", "06-05", "06-06", "06-07"],
  errorCount: [45, 38, 52, 41, 60, 35, 48],
  jsErrorCount: [20, 15, 25, 18, 28, 14, 22],
  promiseErrorCount: [12, 10, 14, 11, 16, 9, 13],
  resourceErrorCount: [13, 13, 13, 12, 16, 12, 13],
};

// --- Mock: 错误列表数据 ---
const mockErrorList = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    errorType: "js",
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    count: 128,
    lastSeen: "2026-06-07 14:32:05",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    errorType: "promise",
    message: "Unhandled Promise rejection: Network request failed",
    count: 95,
    lastSeen: "2026-06-07 13:18:22",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    errorType: "resource",
    message: "Failed to load resource: /static/images/banner.webp",
    count: 76,
    lastSeen: "2026-06-07 12:45:10",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    errorType: "js",
    message: "ReferenceError: process is not defined",
    count: 64,
    lastSeen: "2026-06-06 22:10:33",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    errorType: "ajax",
    message: "POST /api/comments 500 Internal Server Error",
    count: 53,
    lastSeen: "2026-06-07 11:05:47",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    errorType: "promise",
    message: "AbortError: The operation was aborted",
    count: 42,
    lastSeen: "2026-06-06 19:28:55",
  },
  {
    id: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    errorType: "network",
    message: "net::ERR_CONNECTION_TIMED_OUT /api/analytics/track",
    count: 38,
    lastSeen: "2026-06-07 10:22:14",
  },
  {
    id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    errorType: "resource",
    message: "Failed to load resource: /fonts/inter-var.woff2 (404)",
    count: 31,
    lastSeen: "2026-06-05 16:40:09",
  },
  {
    id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    errorType: "framework",
    message: "React: Maximum update depth exceeded in CommentList",
    count: 27,
    lastSeen: "2026-06-06 08:55:41",
  },
  {
    id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    errorType: "js",
    message: "SyntaxError: Unexpected token '<' in JSON at position 0",
    count: 24,
    lastSeen: "2026-06-05 21:33:18",
  },
  {
    id: "e1f2a3b4-c5d6-7890-efab-901234567890",
    errorType: "ajax",
    message: "GET /api/posts?page=2 503 Service Unavailable",
    count: 19,
    lastSeen: "2026-06-04 17:12:06",
  },
  {
    id: "f2a3b4c5-d6e7-8901-fabc-012345678901",
    errorType: "promise",
    message: "TimeoutError: Signal timed out after 30000ms",
    count: 15,
    lastSeen: "2026-06-05 14:08:52",
  },
];

// --- 错误类型 Tag 配色映射 ---
const errorTypeMap: Record<string, { color: string; label: string }> = {
  js: { color: "red", label: "JS" },
  promise: { color: "orange", label: "Promise" },
  resource: { color: "green", label: "资源" },
  ajax: { color: "blue", label: "Ajax" },
  network: { color: "purple", label: "网络" },
  framework: { color: "cyan", label: "框架" },
};

const columns = [
  {
    title: "类型",
    dataIndex: "errorType",
    width: 100,
    render: (type: string) => {
      const config = errorTypeMap[type] || { color: "default", label: type };
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "错误信息",
    dataIndex: "message",
    ellipsis: true,
  },
  {
    title: "发生次数",
    dataIndex: "count",
    width: 110,
    sorter: (
      a: (typeof mockErrorList)[number],
      b: (typeof mockErrorList)[number],
    ) => a.count - b.count,
    defaultSortOrder: "descend" as const,
  },
  {
    title: "最近时间",
    dataIndex: "lastSeen",
    width: 180,
  },
];

const Errors = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={(value) => console.log(value)} />
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>错误趋势</span>
          </div>
          <LineChart
            xData={mockTrendData.xData}
            series={[
              {
                name: "总错误数",
                data: mockTrendData.errorCount,
                color: "#ff4d4f",
              },
              {
                name: "JS错误",
                data: mockTrendData.jsErrorCount,
                color: "#fa8c16",
              },
              {
                name: "Promise错误",
                data: mockTrendData.promiseErrorCount,
                color: "#fadb14",
              },
              {
                name: "资源错误",
                data: mockTrendData.resourceErrorCount,
                color: "#52c41a",
              },
            ]}
            style={{ height: 350 }}
          />
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>错误列表</span>
          </div>
          <Table
            rowKey="id"
            dataSource={mockErrorList}
            columns={columns}
            pagination={{ pageSize: 10 }}
            size="small"
            onRow={(record) => ({
              onClick: () => navigate(`/errors/${record.id}`),
              style: { cursor: "pointer" },
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default Errors;
