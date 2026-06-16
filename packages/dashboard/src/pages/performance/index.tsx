import { useEffect, useMemo, useState } from "react";
import { Select, Table, Skeleton } from "antd";
import dayjs from "dayjs";

import { getPerformance } from "@/api/performance";
import type {
  PerformanceData,
  PerformanceCards,
  SlowPage,
} from "@/api/performance/types";
import { useDateFilterSessionStorage } from "@/hooks/useDateFilterSessionStorage";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart } from "@/components/Charts";
import VitalCard from "@/components/VitalCard";

type CardConfig = {
  key: keyof PerformanceCards;
  title: string;
  description: string;
  unit: string;
  thresholds: [number, number];
  max: number;
};

const softCardConfigs: CardConfig[] = [
  {
    key: "avgLcp",
    title: "LCP",
    description: "路由切换后最大内容绘制",
    unit: "ms",
    thresholds: [2500, 4000],
    max: 5000,
  },
  {
    key: "avgCls",
    title: "CLS",
    description: "路由切换期间布局偏移",
    unit: "",
    thresholds: [0.1, 0.25],
    max: 0.5,
  },
  {
    key: "avgInp",
    title: "INP",
    description: "交互延迟 (P98)",
    unit: "ms",
    thresholds: [200, 500],
    max: 800,
  },
  {
    key: "avgNavDuration",
    title: "Nav Duration",
    description: "DOM 稳定耗时",
    unit: "ms",
    thresholds: [1000, 3000],
    max: 5000,
  },
];

const hardCardConfigs: CardConfig[] = [
  {
    key: "avgTtfb",
    title: "TTFB",
    description: "首字节时间",
    unit: "ms",
    thresholds: [800, 1800],
    max: 3000,
  },
  {
    key: "avgFcp",
    title: "FCP",
    description: "首次内容绘制",
    unit: "ms",
    thresholds: [1800, 3000],
    max: 5000,
  },
  {
    key: "avgLcp",
    title: "LCP",
    description: "最大内容绘制",
    unit: "ms",
    thresholds: [2500, 4000],
    max: 5000,
  },
  {
    key: "avgCls",
    title: "CLS",
    description: "累计布局偏移",
    unit: "",
    thresholds: [0.1, 0.25],
    max: 0.5,
  },
];

const allCardConfigs: CardConfig[] = [
  {
    key: "avgLcp",
    title: "LCP",
    description: "最大内容绘制",
    unit: "ms",
    thresholds: [2500, 4000],
    max: 5000,
  },
  {
    key: "avgCls",
    title: "CLS",
    description: "累计布局偏移",
    unit: "",
    thresholds: [0.1, 0.25],
    max: 0.5,
  },
  {
    key: "avgInp",
    title: "INP",
    description: "交互延迟 (P98)",
    unit: "ms",
    thresholds: [200, 500],
    max: 800,
  },
];

const cardConfigMap = {
  soft: softCardConfigs,
  hard: hardCardConfigs,
  all: allCardConfigs,
};

const SERIES_DISPLAY_NAME: Record<string, string> = {
  avgLcp: "LCP",
  avgCls: "CLS×1000",
  avgInp: "INP",
  avgNavDuration: "Nav Duration",
  avgTtfb: "TTFB",
  avgFcp: "FCP",
};

const trendChartTitle: Record<string, string> = {
  soft: "软导航指标趋势",
  hard: "硬导航指标趋势",
  all: "全量指标趋势",
};

const tableTitle: Record<string, string> = {
  soft: "慢路由切换 Top10",
  hard: "慢页面 Top10",
  all: "慢页面 Top10",
};

const SKELETON_ROWS: any[] = Array.from({ length: 10 }, (_, i) => ({
  url: `__skeleton__${i}`,
}));

const buildSlowPagesColumns = (navigationType: string, loading: boolean) => {
  const rankCol = {
    title: "排名",
    key: "rank",
    width: 60,
    render: (_: SlowPage, __: SlowPage, index: number) =>
      loading ? (
        <Skeleton.Input size="small" active />
      ) : (
        <span>{index + 1}</span>
      ),
  };

  if (navigationType === "soft") {
    return [
      rankCol,
      {
        title: "来源路由",
        dataIndex: "fromUrl",
        render: (val: string) =>
          loading ? (
            <Skeleton.Input size="small" active block />
          ) : (
            <span>{val}</span>
          ),
      },
      {
        title: "目标路由",
        dataIndex: "url",
        render: (val: string) =>
          loading ? (
            <Skeleton.Input size="small" active block />
          ) : (
            <span>{val}</span>
          ),
      },
      {
        title: "平均 LCP (ms)",
        dataIndex: "avgLcp",
        defaultSortOrder: "descend" as const,
        sorter: (a: SlowPage, b: SlowPage) => (a.avgLcp ?? 0) - (b.avgLcp ?? 0),
        render: (val: number | null) =>
          loading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <span>{val ?? "-"}</span>
          ),
      },
      {
        title: "平均切换耗时 (ms)",
        dataIndex: "avgNavDuration",
        render: (val: number | null) =>
          loading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <span>{val ?? "-"}</span>
          ),
      },
      {
        title: "样本数",
        dataIndex: "sampleCount",
        render: (val: number) =>
          loading ? <Skeleton.Input size="small" active /> : <span>{val}</span>,
      },
    ];
  }

  if (navigationType === "hard") {
    return [
      rankCol,
      {
        title: "页面URL",
        dataIndex: "url",
        render: (val: string) =>
          loading ? (
            <Skeleton.Input size="small" active block />
          ) : (
            <span>{val}</span>
          ),
      },
      {
        title: "平均 LCP (ms)",
        dataIndex: "avgLcp",
        defaultSortOrder: "descend" as const,
        sorter: (a: SlowPage, b: SlowPage) => (a.avgLcp ?? 0) - (b.avgLcp ?? 0),
        render: (val: number | null) =>
          loading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <span>{val ?? "-"}</span>
          ),
      },
      {
        title: "平均 FCP (ms)",
        dataIndex: "avgFcp",
        render: (val: number | null) =>
          loading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <span>{val ?? "-"}</span>
          ),
      },
      {
        title: "平均 TTFB (ms)",
        dataIndex: "avgTtfb",
        render: (val: number | null) =>
          loading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <span>{val ?? "-"}</span>
          ),
      },
      {
        title: "样本数",
        dataIndex: "sampleCount",
        render: (val: number) =>
          loading ? <Skeleton.Input size="small" active /> : <span>{val}</span>,
      },
    ];
  }

  // all
  return [
    rankCol,
    {
      title: "页面URL",
      dataIndex: "url",
      render: (val: string) =>
        loading ? (
          <Skeleton.Input size="small" active block />
        ) : (
          <span>{val}</span>
        ),
    },
    {
      title: "平均 LCP (ms)",
      dataIndex: "avgLcp",
      defaultSortOrder: "descend" as const,
      sorter: (a: SlowPage, b: SlowPage) => (a.avgLcp ?? 0) - (b.avgLcp ?? 0),
      render: (val: number | null) =>
        loading ? (
          <Skeleton.Input size="small" active />
        ) : (
          <span>{val ?? "-"}</span>
        ),
    },
    {
      title: "平均 INP (ms)",
      dataIndex: "avgInp",
      render: (val: number | null) =>
        loading ? (
          <Skeleton.Input size="small" active />
        ) : (
          <span>{val ?? "-"}</span>
        ),
    },
    {
      title: "平均 FCP (ms)",
      dataIndex: "avgFcp",
      render: (val: number | null) =>
        loading ? (
          <Skeleton.Input size="small" active />
        ) : (
          <span>{val ?? "-"}</span>
        ),
    },
    {
      title: "样本数",
      dataIndex: "sampleCount",
      render: (val: number) =>
        loading ? <Skeleton.Input size="small" active /> : <span>{val}</span>,
    },
  ];
};

const navigationTypeOptions = [
  { label: "软导航", value: "soft" },
  { label: "硬导航", value: "hard" },
  { label: "全部", value: "all" },
];

const Performance = () => {
  const { preset, dateRange, onDateChange } = useDateFilterSessionStorage({
    storageKey: "performance",
    defaultPreset: "7d",
  });
  const [navigationType, setNavigationType] = useState("soft");
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);

  const isSingleDay = useMemo(
    () =>
      dayjs(dateRange[0]).format("YYYY-MM-DD") ===
      dayjs(dateRange[1]).format("YYYY-MM-DD"),
    [dateRange],
  );
  const granularity = isSingleDay ? "hour" : "day";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerformanceData(null);
    let cancelled = false;
    getPerformance({
      startDate: dateRange[0],
      endDate: dateRange[1],
      navigationType: navigationType as "soft" | "hard" | "all",
      granularity,
    })
      .then((res) => {
        if (!cancelled) setPerformanceData(res.data);
      })
      .catch((error) =>
        console.error("Failed to fetch performance data:", error),
      );
    return () => {
      cancelled = true;
    };
  }, [dateRange, navigationType, granularity]);

  const cards = performanceData?.cards;
  const trend = performanceData?.trend;
  const slowPages = performanceData?.slowPages ?? [];

  const cardConfigs =
    cardConfigMap[navigationType as keyof typeof cardConfigMap];
  const loading = performanceData === null;

  const trendSeries = useMemo(() => {
    if (!trend) return [];
    return trend.series.map((s) => {
      if (s.name === "avgCls") {
        return {
          name: SERIES_DISPLAY_NAME[s.name],
          data: s.data.map((v) => v * 1000),
        };
      }
      return { name: SERIES_DISPLAY_NAME[s.name] || s.name, data: s.data };
    });
  }, [trend]);

  // 确保即使 URL 相同的记录也有唯一的 key
  const slowPageRowKey = (record: SlowPage, index?: number) => {
    const safeIndex = index ?? 0;
    return navigationType === "soft"
      ? `${record.fromUrl ?? "-"}__${record.url}__${safeIndex}`
      : `${record.url}__${safeIndex}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={onDateChange} preset={preset} value={dateRange} />
        <Select
          value={navigationType}
          onChange={setNavigationType}
          options={navigationTypeOptions}
          style={{ width: 120 }}
        />
      </div>

      <div className={styles.cardContainer}>
        {loading
          ? cardConfigs.map((cfg) => (
              <div key={cfg.key} className={styles.skeletonCard}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))
          : cardConfigs.map((cfg) => (
              <VitalCard
                key={cfg.key}
                title={cfg.title}
                description={cfg.description}
                value={cards?.[cfg.key] ?? 0}
                unit={cfg.unit}
                thresholds={cfg.thresholds}
                max={cfg.max}
              />
            ))}
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>
              {trendChartTitle[navigationType]}
            </span>
          </div>
          <LineChart
            xData={trend?.xData ?? []}
            series={trendSeries}
            style={{ height: 350 }}
            loading={loading}
          />
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>{tableTitle[navigationType]}</span>
          </div>
          <Table
            rowKey={slowPageRowKey}
            dataSource={loading ? SKELETON_ROWS : slowPages}
            columns={buildSlowPagesColumns(navigationType, loading)}
            pagination={false}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

export default Performance;
