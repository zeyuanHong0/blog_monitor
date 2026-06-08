import { Statistic, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { LineChart } from "@/components/Charts";
import UptimeTimeline from "@/components/UptimeTimeline";

import styles from "./index.module.scss";

interface DayStatus {
  date: string;
  status: "up" | "down" | "noData";
  description?: string;
}

interface Incident {
  checkTime: string;
  statusCode: number;
  responseTime: number;
  errorMessage: string;
}

const sslExpiry = "2026-09-15T00:00:00Z";

const timelineFixedData: DayStatus[] = [
  { date: "2026-05-10", status: "up", description: "全天正常" },
  { date: "2026-05-11", status: "up", description: "全天正常" },
  { date: "2026-05-12", status: "up", description: "全天正常" },
  { date: "2026-05-13", status: "down", description: "服务中断 23 分钟" },
  { date: "2026-05-14", status: "up", description: "全天正常" },
  { date: "2026-05-15", status: "up", description: "全天正常" },
  { date: "2026-05-16", status: "up", description: "全天正常" },
];

const responseTrendData = {
  xData: [
    "2026-06-07 00:00",
    "2026-06-07 01:00",
    "2026-06-07 02:00",
    "2026-06-07 03:00",
    "2026-06-07 04:00",
    "2026-06-07 05:00",
  ],
  data: [120, 115, 98, 95, 102, 110],
};

const incidents: Incident[] = [
  {
    checkTime: "2026-06-05 14:32:10",
    statusCode: 503,
    responseTime: 5230,
    errorMessage: "上游服务不可用，网关返回 503",
  },
  {
    checkTime: "2026-06-04 03:15:44",
    statusCode: 502,
    responseTime: 8120,
    errorMessage: "反向代理连接后端超时，返回 Bad Gateway",
  },
  {
    checkTime: "2026-06-01 22:08:33",
    statusCode: 500,
    responseTime: 4500,
    errorMessage: "服务器内部异常，数据库连接池耗尽",
  },
  {
    checkTime: "2026-05-28 09:45:21",
    statusCode: 408,
    responseTime: 10000,
    errorMessage: "请求超时，服务端未在规定时间内响应",
  },
  {
    checkTime: "2026-05-25 16:22:05",
    statusCode: 503,
    responseTime: 6340,
    errorMessage: "服务维护中，暂时不可用",
  },
];

const incidentColumns: ColumnsType<Incident> = [
  {
    title: "时间",
    dataIndex: "checkTime",
    key: "checkTime",
    width: 180,
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
  const timelineData = timelineFixedData;
  const responseTrend = responseTrendData;

  const sslDaysLeft = dayjs(sslExpiry).diff(dayjs(), "day");

  return (
    <div className={styles.page}>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Statistic
            title="近 24 小时可用率"
            value={99.87}
            suffix="%"
            precision={2}
          />
        </div>
        <div className={styles.statCard}>
          <Statistic title="SSL 证书到期" value={sslDaysLeft} suffix="天" />
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>30 天可用性</div>
        <UptimeTimeline data={timelineData} />
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>响应时间趋势</div>
        <LineChart
          xData={responseTrend.xData}
          series={[
            {
              name: "平均响应时间",
              data: responseTrend.data,
              color: "#1890ff",
            },
          ]}
          style={{ height: 300 }}
        />
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>故障记录</div>
        <Table<Incident>
          rowKey="checkTime"
          dataSource={incidents}
          columns={incidentColumns}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 600 }}
        />
      </div>
    </div>
  );
};

export default Uptime;
