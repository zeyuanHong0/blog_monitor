import { Table } from "antd";

import styles from "./index.module.scss";
import DateSelect from "@/components/DateSelect";
import { LineChart, PieChart } from "@/components/Charts";

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
            <span className={styles.title}>访问来源分布</span>
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
    </div>
  );
};

export default Traffic;
