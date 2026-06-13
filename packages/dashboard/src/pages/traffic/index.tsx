import { useEffect, useMemo, useState } from "react";
import { Table, Skeleton } from "antd";
import dayjs from "dayjs";

import { getTraffic } from "@/api/traffic";
import type { TrafficData, TopPage } from "@/api/traffic/types";
import { getDefaultRange } from "@/utils/dateRange";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart, BarChart } from "@/components/Charts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SKELETON_ROWS: any[] = Array.from({ length: 5 }, (_, i) => ({
  url: `__skeleton__${i}`,
}));

const buildTopPagesColumns = (loading: boolean) => [
  {
    title: "排名",
    key: "rank",
    width: 60,
    render: (_: TopPage, __: TopPage, index: number) =>
      loading ? (
        <Skeleton.Input size="small" active />
      ) : (
        <span>{index + 1}</span>
      ),
  },
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
    title: "访问次数",
    dataIndex: "count",
    width: 90,
    render: (val: number) =>
      loading ? <Skeleton.Input size="small" active /> : <span>{val}</span>,
  },
];

const hourlyXData = Array.from({ length: 24 }, (_, i) => `${i}时`);

const DEFAULT_TREND: TrafficData["trend"] = {
  dateList: [] as string[],
  pvData: { name: "PV", data: [] as number[] },
  uvData: { name: "UV", data: [] as number[] },
};

const Traffic = () => {
  const [searchDateRange, setSearchDateRange] = useState<[string, string]>(
    getDefaultRange("today"),
  );
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const isSingleDay = useMemo(
    () =>
      dayjs(searchDateRange[0]).format("YYYY-MM-DD") ===
      dayjs(searchDateRange[1]).format("YYYY-MM-DD"),
    [searchDateRange],
  );
  const granularity = isSingleDay ? "hour" : "day";
  useEffect(() => {
    let cancelled = false;
    getTraffic({
      startDate: searchDateRange[0],
      endDate: searchDateRange[1],
      granularity,
    })
      .then((res) => {
        if (!cancelled) setTrafficData(res.data);
      })
      .catch((error) => console.error("Failed to fetch traffic data:", error));
    return () => {
      cancelled = true;
    };
  }, [searchDateRange, granularity]);
  const trend = trafficData?.trend ?? DEFAULT_TREND;
  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={setSearchDateRange} defaultPreset="today" />
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>PV / UV 趋势</span>
            {isSingleDay && <span className={styles.desc}>按小时统计</span>}
          </div>
          <LineChart
            xData={trend.dateList}
            series={[trend.pvData, trend.uvData]}
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
            dataSource={
              trafficData === null ? SKELETON_ROWS : trafficData.topPages
            }
            columns={buildTopPagesColumns(trafficData === null)}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>访问时段分布</span>
            <span className={styles.desc}>按小时统计 PV</span>
          </div>
          <BarChart
            xData={hourlyXData}
            data={trafficData?.hourlyDistribution || []}
            name="PV"
            color="#5B8FF9"
          />
        </div>
      </div>
    </div>
  );
};

export default Traffic;
