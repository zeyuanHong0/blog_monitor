import { useState } from "react";
import { Select, Table } from "antd";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart } from "@/components/Charts";
import VitalCard from "@/components/VitalCard";

// TODO: 接入 API 后，根据 navigationType 筛选器值联动以下内容：
// - 软导航（默认）: 卡片 LCP/CLS/INP/Nav Duration，折线图 series 同理
// - 硬导航: 卡片换成 TTFB/FCP/LCP/CLS，折线图 series 对应切换，表格去掉 fromUrl 列改为按 URL 排慢页面
// - 全部: 展示共有指标 LCP/CLS/INP，或做硬/软对比
const cardList = [
  {
    title: "LCP",
    description: "路由切换后最大内容绘制",
    value: 2200,
    unit: "ms",
    thresholds: [2500, 4000] as [number, number],
    max: 5000,
  },
  {
    title: "CLS",
    description: "路由切换期间布局偏移",
    value: 0.08,
    unit: "",
    thresholds: [0.1, 0.25] as [number, number],
    max: 0.5,
  },
  {
    title: "INP",
    description: "交互延迟 (P98)",
    value: 150,
    unit: "ms",
    thresholds: [200, 500] as [number, number],
    max: 800,
  },
  {
    title: "Nav Duration",
    description: "DOM 稳定耗时",
    value: 800,
    unit: "ms",
    thresholds: [1000, 3000] as [number, number],
    max: 5000,
  },
];

const mockSlowRoutes = [
  {
    fromUrl: "/",
    url: "/post/react-performance-tips",
    avgLcp: 4800,
    avgNavDuration: 2200,
    sampleCount: 312,
  },
  {
    fromUrl: "/category/frontend",
    url: "/post/deep-dive-into-hooks",
    avgLcp: 4500,
    avgNavDuration: 1950,
    sampleCount: 278,
  },
  {
    fromUrl: "/",
    url: "/post/css-grid-complete-guide",
    avgLcp: 4200,
    avgNavDuration: 1800,
    sampleCount: 456,
  },
  {
    fromUrl: "/tag/typescript",
    url: "/post/advanced-typescript-patterns",
    avgLcp: 3900,
    avgNavDuration: 1650,
    sampleCount: 189,
  },
  {
    fromUrl: "/category/backend",
    url: "/post/nodejs-stream-handbook",
    avgLcp: 3650,
    avgNavDuration: 1500,
    sampleCount: 534,
  },
  {
    fromUrl: "/",
    url: "/post/web-vitals-explained",
    avgLcp: 3400,
    avgNavDuration: 1350,
    sampleCount: 421,
  },
  {
    fromUrl: "/post/react-performance-tips",
    url: "/post/react-concurrent-mode",
    avgLcp: 3150,
    avgNavDuration: 1200,
    sampleCount: 267,
  },
  {
    fromUrl: "/category/devops",
    url: "/post/docker-multi-stage-builds",
    avgLcp: 2950,
    avgNavDuration: 1100,
    sampleCount: 345,
  },
  {
    fromUrl: "/",
    url: "/category/frontend",
    avgLcp: 2700,
    avgNavDuration: 950,
    sampleCount: 623,
  },
  {
    fromUrl: "/post/css-grid-complete-guide",
    url: "/post/responsive-design-2024",
    avgLcp: 2500,
    avgNavDuration: 880,
    sampleCount: 198,
  },
];

const slowRoutesColumns = [
  {
    title: "来源路由",
    dataIndex: "fromUrl",
  },
  {
    title: "目标路由",
    dataIndex: "url",
  },
  {
    title: "平均 LCP (ms)",
    dataIndex: "avgLcp",
    defaultSortOrder: "descend" as const,
    sorter: (
      a: (typeof mockSlowRoutes)[number],
      b: (typeof mockSlowRoutes)[number],
    ) => a.avgLcp - b.avgLcp,
  },
  {
    title: "平均切换耗时 (ms)",
    dataIndex: "avgNavDuration",
  },
  {
    title: "样本数",
    dataIndex: "sampleCount",
  },
];

const navigationTypeOptions = [
  { label: "软导航", value: "soft" },
  { label: "硬导航", value: "hard" },
  { label: "全部", value: "all" },
];

const Performance = () => {
  const [navigationType, setNavigationType] = useState("soft");

  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={(value) => console.log(value)} />
        <Select
          value={navigationType}
          onChange={setNavigationType}
          options={navigationTypeOptions}
          style={{ width: 120 }}
        />
      </div>
      <div className={styles.cardContainer}>
        {cardList.map((item) => (
          <VitalCard
            key={item.title}
            title={item.title}
            description={item.description}
            value={item.value}
            unit={item.unit}
            thresholds={item.thresholds}
            max={item.max}
          />
        ))}
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>软导航指标趋势</span>
          </div>
          {/* TODO: 接入 API 后，折线图 series 根据 navigationType 动态切换 */}
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
                name: "avgLcp",
                data: [2300, 2150, 2400, 2200, 2100, 2350, 2180],
              },
              {
                name: "avgInp",
                data: [160, 140, 180, 120, 170, 145, 155],
              },
              {
                name: "avgNavDuration",
                data: [850, 780, 920, 700, 960, 830, 750],
              },
              {
                name: "avgCls×1000",
                data: [80, 72, 95, 68, 88, 76, 65],
              },
            ]}
            style={{ height: 350 }}
          />
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>慢路由切换 Top10</span>
          </div>
          <Table
            rowKey="url"
            dataSource={mockSlowRoutes}
            columns={slowRoutesColumns}
            pagination={false}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

export default Performance;
