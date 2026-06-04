import { useState, useEffect } from "react";
import { BarChart3, UserRound, Bug, ShieldCheck } from "lucide-react";
import { Table, Tag } from "antd";

import styles from "./index.module.scss";
import StatCard from "@/components/StatCard";
import { LineChart, PieChart } from "@/components/Charts";

interface CardItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    text: string;
  };
}

const mockTopPages = [
  { url: "/home", count: 1523 },
  { url: "/blog/react-hooks-guide", count: 876 },
  { url: "/about", count: 654 },
  { url: "/blog/typescript-best-practices", count: 421 },
  { url: "/contact", count: 298 },
];
const topPagesColumns = [
  {
    title: "排名",
    key: "rank",
    render: (_: any, __: any, index: number) => <span>{index + 1}</span>,
  },
  {
    title: "页面URL",
    dataIndex: "url",
  },
  {
    title: "访问次数",
    dataIndex: "count",
  },
];

const errorTypeConfig: Record<string, { color: string; label: string }> = {
  js: { color: "red", label: "JS 错误" },
  promise: { color: "orange", label: "Promise" },
  resource: { color: "volcano", label: "资源" },
};

const latestErrorsColumns = [
  {
    title: "类型",
    dataIndex: "errorType",
    width: 100,
    render: (type: string) => {
      const cfg = errorTypeConfig[type];
      return <Tag color={cfg?.color}>{cfg?.label ?? type}</Tag>;
    },
  },
  {
    title: "错误信息",
    dataIndex: "message",
  },
  {
    title: "页面",
    dataIndex: "url",
    ellipsis: true,
    width: 150,
  },
  {
    title: "时间",
    dataIndex: "createTime",
    width: 200,
  },
];

const mockLatestErrors = [
  {
    id: "1",
    errorType: "js",
    message: "Cannot read properties of undefined (reading 'map')",
    url: "/blog/react-hooks-guide",
    createTime: "2026-06-04 14:32:18",
  },
  {
    id: "2",
    errorType: "promise",
    message: "Network Error: Request failed with status code 500",
    url: "/api/posts",
    createTime: "2026-06-04 13:58:42",
  },
  {
    id: "3",
    errorType: "resource",
    message: "Failed to load resource: https://cdn.example.com/image.png",
    url: "/home",
    createTime: "2026-06-04 12:15:07",
  },
  {
    id: "4",
    errorType: "js",
    message: "TypeError: Cannot set property 'innerHTML' of null",
    url: "/about",
    createTime: "2026-06-04 11:44:33",
  },
  {
    id: "5",
    errorType: "promise",
    message: "Unhandled rejection: timeout of 10000ms exceeded",
    url: "/contact",
    createTime: "2026-06-04 10:22:56",
  },
];

const Overview = () => {
  const [cardList, setCardList] = useState<CardItem[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setCardList([
        {
          title: "今日 PV",
          value: "128,540",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <BarChart3 size={20} />,
        },
        {
          title: "今日 UV",
          value: "128,540",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <UserRound size={20} />,
        },
        {
          title: "今日错误数",
          value: "128,540",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <Bug size={20} />,
        },
        {
          title: "可用率",
          value: "99%",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <ShieldCheck size={20} />,
        },
      ]);
    }, 1000);
  }, []);
  return (
    <div className={styles.page}>
      {/* <div className={styles.selectBox}>
        <DateSelect onChange={(value) => console.log(value)} />
      </div> */}
      <div className={styles.cardContainer}>
        {cardList.map((item) => (
          <StatCard
            title={item.title}
            value={item.value}
            trend={item.trend}
            icon={item.icon}
          />
        ))}
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>PV / UV 趋势</span>
            <span className={styles.desc}>过去7天</span>
          </div>
          <LineChart
            xData={[
              "06-01",
              "06-02",
              "06-03",
              "06-04",
              "06-05",
              "06-06",
              "06-07",
            ]}
            series={[
              {
                name: "PV",
                data: [120, 132, 101, 134, 90, 230, 210],
                color: "#1890ff",
              },
              {
                name: "UV",
                data: [30, 40, 35, 50, 49, 60, 70],
                color: "#52c41a",
              },
            ]}
          />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>今日来源分布</span>
          </div>
          <PieChart
            data={[
              { name: "来源A", value: 10 },
              { name: "来源B", value: 20 },
              { name: "来源C", value: 30 },
              { name: "来源D", value: 40 },
            ]}
          />
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>热门页面Top5</span>
          </div>
          <Table
            rowKey="url"
            dataSource={mockTopPages}
            columns={topPagesColumns}
            pagination={false}
            size="small"
          />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>最新错误列表</span>
          </div>
          <Table
            rowKey="id"
            dataSource={mockLatestErrors}
            columns={latestErrorsColumns}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
