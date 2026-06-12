import { useState, useEffect } from "react";
import { BarChart3, UserRound, Bug, ShieldCheck } from "lucide-react";
import { Table, Tag } from "antd";

import { getOverview } from "@/api/overview";
import type { OverviewData } from "@/api/overview/types";

import styles from "./index.module.scss";
import StatCard from "@/components/StatCard";
import { LineChart, PieChart } from "@/components/Charts";

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

const DEFAULT_TREND = {
  dateList: [] as string[],
  pvData: { name: "PV", data: [] as number[] },
  uvData: { name: "UV", data: [] as number[] },
  errorCountData: { name: "错误数", data: [] as number[] },
};

const Overview = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  useEffect(() => {
    getOverview()
      .then((res) => setOverviewData(res.data))
      .catch((error) => console.error("Failed to fetch overview data:", error));
  }, []);

  const today = overviewData?.today;
  const trend = overviewData?.trend ?? DEFAULT_TREND;

  const cardList = [
    {
      title: "今日 PV",
      value: today?.pv ?? "-",
      icon: <BarChart3 size={20} />,
    },
    {
      title: "今日 UV",
      value: today?.uv ?? "-",
      icon: <UserRound size={20} />,
    },
    {
      title: "今日错误数",
      value: today?.errorCount ?? "-",
      icon: <Bug size={20} />,
    },
    {
      title: "近 24小时可用率",
      value: overviewData ? `${overviewData.uptime}%` : "-",
      icon: <ShieldCheck size={20} />,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.cardContainer}>
        {cardList.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>
      <div className={styles.chartContainer}>
        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>PV / UV 趋势</span>
            <span className={styles.desc}>过去7天</span>
          </div>
          <LineChart
            xData={trend.dateList}
            series={[trend.pvData, trend.uvData, trend.errorCountData]}
          />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>今日浏览器分布</span>
          </div>
          <PieChart data={today?.browserDistribution ?? []} />
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>今日设备类型分布</span>
          </div>
          <PieChart data={today?.deviceDistribution ?? []} />
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>热门页面Top5</span>
          </div>
          <Table
            rowKey="url"
            dataSource={today?.topPages ?? []}
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
            dataSource={overviewData?.latestErrors ?? []}
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
