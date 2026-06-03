import { useState, useEffect } from "react";
import { Eye, Users, MousePointerClick, UserCheck } from "lucide-react";

import styles from "./index.module.scss";
import StatCard from "@/components/StatCard";
// import DateSelect from "@/components/DateSelect";
import LineChart from "@/components/Charts/LineChart";

interface CardItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    text: string;
  };
}

const Overview = () => {
  const [cardList, setCardList] = useState<CardItem[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setCardList([
        {
          title: "今日 PV",
          value: "128,540",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <Eye size={20} />,
        },
        {
          title: "今日 UV",
          value: "128,540",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <Users size={20} />,
        },
        {
          title: "今日错误数",
          value: "128,540",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <MousePointerClick size={20} />,
        },
        {
          title: "可用率",
          value: "99%",
          // trend: { text: "↑ 12.5% vs 上周" },
          icon: <UserCheck size={20} />,
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
    </div>
  );
};

export default Overview;
