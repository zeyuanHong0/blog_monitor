import { Table } from "antd";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart, BarChart } from "@/components/Charts";

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

const mockHourlyData = [
  8, 5, 3, 2, 2, 4, 10, 28, 45, 60, 72, 80,
  75, 68, 55, 50, 58, 70, 65, 50, 38, 25, 15, 10,
];
const hourlyXData = Array.from({ length: 24 }, (_, i) => `${i}时`);

const Traffic = () => {
  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={(value) => console.log(value)} />
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>PV / UV 趋势</span>
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
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span className={styles.title}>热门页面Top10</span>
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
            <span className={styles.title}>访问时段分布</span>
            <span className={styles.desc}>按小时统计 PV</span>
          </div>
          <BarChart
            xData={hourlyXData}
            data={mockHourlyData}
            name="PV"
            color="#5B8FF9"
          />
        </div>
      </div>
    </div>
  );
};

export default Traffic;
