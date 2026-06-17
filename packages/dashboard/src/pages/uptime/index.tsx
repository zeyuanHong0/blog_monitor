import { useEffect, useState } from "react";
import { Statistic, Table, Skeleton, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { getUptime } from "@/api/uptime";
import type { UptimeData, FailureRecord } from "@/api/uptime/types";

import { LineChart } from "@/components/Charts";
import UptimeTimeline from "@/components/UptimeTimeline";
import styles from "./index.module.scss";

const failureColumns: ColumnsType<FailureRecord> = [
  {
    title: "时间",
    dataIndex: "checkTime",
    key: "checkTime",
    width: 180,
    render: (val: string) => dayjs(val).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "状态码",
    dataIndex: "statusCode",
    key: "statusCode",
    width: 100,
  },
  {
    title: "响应时间",
    dataIndex: "responseTime",
    key: "responseTime",
    width: 120,
    render: (val: number) => `${val} ms`,
  },
  {
    title: "错误信息",
    dataIndex: "errorMessage",
    key: "errorMessage",
  },
];

const Uptime = () => {
  const [uptimeData, setUptimeData] = useState<UptimeData | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUptime()
      .then((res) => {
        if (!cancelled) setUptimeData(res.data);
      })
      .catch((error) => console.error("Failed to fetch uptime data:", error));
    return () => {
      cancelled = true;
    };
  }, []);

  const sslDaysLeft = uptimeData?.sslExpiry
    ? dayjs(uptimeData.sslExpiry).diff(dayjs(), "day")
    : null;

  // 从 "2026-06-17 14:00:00" 中提取 "HH:00"
  const responseTrendChart = {
    xData:
      uptimeData?.responseTrend?.map((r) => {
        const parts = r.hour.split(" ");
        return parts[1]?.slice(0, 5) ?? r.hour;
      }) ?? [],
    data:
      uptimeData?.responseTrend?.map((r) => r.avgResponseTime ?? 0) ?? [],
  };

  return (
    <div className={styles.page}>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          {uptimeData === null ? (
            <Skeleton.Input active size="small" />
          ) : (
            <Statistic
              title="近 24 小时可用率"
              value={uptimeData.uptime24h}
              suffix="%"
              precision={2}
            />
          )}
        </div>
        <div className={styles.statCard}>
          {uptimeData === null ? (
            <Skeleton.Input active size="small" />
          ) : (
            <Statistic
              title="SSL 证书到期"
              value={sslDaysLeft ?? "--"}
              suffix={sslDaysLeft !== null ? "天" : undefined}
            />
          )}
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>30 天可用性</div>
        {uptimeData === null ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : (
          <UptimeTimeline data={uptimeData.dailyStatus} />
        )}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>响应时间趋势</div>
        {uptimeData === null ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : responseTrendChart.xData.length === 0 ? (
          <Empty description="暂无数据" />
        ) : (
          <LineChart
            xData={responseTrendChart.xData}
            series={[
              {
                name: "平均响应时间",
                data: responseTrendChart.data,
                color: "#1890ff",
              },
            ]}
            style={{ height: 300 }}
          />
        )}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>故障记录</div>
        <Table<FailureRecord>
          rowKey="id"
          dataSource={uptimeData === null ? [] : uptimeData.failureRecords}
          columns={failureColumns}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 600 }}
          loading={uptimeData === null}
          locale={{
            emptyText: <Empty description="暂无故障记录" />,
          }}
        />
      </div>
    </div>
  );
};

export default Uptime;
