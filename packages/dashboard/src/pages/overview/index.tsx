import { useState, useEffect } from "react";
import { Eye, Users, MousePointerClick, UserCheck } from "lucide-react";

import styles from "./index.module.scss";
import StatCard from "@/components/StatCard";
import DateSelect from "@/components/DateSelect";

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
          title: "PV 总访问量",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周" },
          icon: <Eye size={20} />,
        },
        {
          title: "UV 唯一访问",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周" },
          icon: <Users size={20} />,
        },
        {
          title: "访问次数",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周" },
          icon: <MousePointerClick size={20} />,
        },
        {
          title: "访问人数",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周" },
          icon: <UserCheck size={20} />,
        },
      ]);
    }, 1000);
  }, []);
  return (
    <div className={styles.page}>
      <div className={styles.selectBox}>
        <DateSelect onChange={(value) => console.log(value)} />
      </div>
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
    </div>
  );
};

export default Overview;
