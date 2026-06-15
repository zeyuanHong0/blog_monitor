import { useEffect, useMemo, useState } from "react";
import { Skeleton, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { getErrors } from "@/api/errors";
import type { ErrorsData } from "@/api/errors/types";
import { getDefaultRange } from "@/utils/dateRange";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart } from "@/components/Charts";

const SKELETON_ROWS: any[] = Array.from({ length: 5 }, (_, index) => ({
  id: `__skeleton__${index}`,
  errorType: "",
  message: "",
  lastSeen: "",
}));

// 错误类型 Tag 颜色
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

const buildColumns = (loading: boolean) => [
  {
    title: "类型",
    dataIndex: "errorType",
    width: 150,
    render: (type: string) => {
      if (loading) {
        return <Skeleton.Input size="small" active />;
      }
      const config = errorTypeMap[type] || { color: "default", label: type };
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "错误信息",
    dataIndex: "message",
    ellipsis: true,
    render: (value: string) =>
      loading ? (
        <Skeleton.Input size="small" active block />
      ) : (
        <span>{value}</span>
      ),
  },
  {
    title: "发生时间",
    dataIndex: "lastSeen",
    width: 200,
    render: (value: string) =>
      loading ? (
        <Skeleton.Input size="small" active />
      ) : (
        <span>{dayjs(value).format("YYYY-MM-DD HH:mm:ss")}</span>
      ),
  },
];

const DEFAULT_TREND: ErrorsData["trend"] = {
  dateList: [] as string[],
  jsErrorCountData: { name: "JS错误数", data: [] as number[] },
  promiseErrorCountData: { name: "Promise错误数", data: [] as number[] },
  resourceErrorCountData: { name: "资源错误数", data: [] as number[] },
  ajaxErrorCountData: { name: "接口错误数", data: [] as number[] },
  networkErrorCountData: { name: "网络错误数", data: [] as number[] },
  otherErrorCountData: { name: "其他错误数", data: [] as number[] },
};

const Errors = () => {
  const navigate = useNavigate();
  const [searchDateRange, setSearchDateRange] = useState<[string, string]>(
    getDefaultRange("today"),
  );
  const [errors, setErrors] = useState<ErrorsData | null>(null);
  const isSingleDay = useMemo(
    () =>
      dayjs(searchDateRange[0]).format("YYYY-MM-DD") ===
      dayjs(searchDateRange[1]).format("YYYY-MM-DD"),
    [searchDateRange],
  );
  const granularity = isSingleDay ? "hour" : "day";
  useEffect(() => {
    let cancelled = false;
    getErrors({
      startDate: searchDateRange[0],
      endDate: searchDateRange[1],
      granularity,
    })
      .then((res) => {
        if (!cancelled) setErrors(res.data);
      })
      .catch((error) => console.error("Failed to fetch error data:", error));
    return () => {
      cancelled = true;
    };
  }, [searchDateRange, granularity]);
  const trend = errors?.trend ?? DEFAULT_TREND;
  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={setSearchDateRange} defaultPreset="today" />
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>错误趋势</span>
          </div>
          <LineChart
            xData={trend.dateList ?? []}
            series={[
              trend.jsErrorCountData,
              trend.promiseErrorCountData,
              trend.resourceErrorCountData,
              trend.ajaxErrorCountData,
              trend.networkErrorCountData,
              trend.otherErrorCountData,
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
            dataSource={errors === null ? SKELETON_ROWS : (errors?.list ?? [])}
            columns={buildColumns(errors === null)}
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
