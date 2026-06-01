import { useState, useEffect } from "react";

import styles from "./index.module.scss";
import StatCard from "@/components/StatCard";
import type { CardType, TrendType } from "@/constants/colors";

interface CardItem {
  title: string;
  value: string | number;
  type: CardType;
  trend?: {
    text: string;
    type: TrendType;
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
          trend: { text: "↑ 12.5% vs 上周", type: "up" },
          type: "primary",
        },
        {
          title: "UV 唯一访问",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周", type: "up" },
          type: "primary",
        },
        {
          title: "访问次数",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周", type: "up" },
          type: "primary",
        },
        {
          title: "访问人数",
          value: "128,540",
          trend: { text: "↑ 12.5% vs 上周", type: "up" },
          type: "danger",
        },
      ]);
    }, 1000);
  }, []);
  return (
    <div className={styles.page}>
      <div className={styles.cardContainer}>
        {cardList.map((item) => (
          <StatCard
            title={item.title}
            value={item.value}
            trend={item.trend}
            type={item.type}
          />
        ))}
      </div>
    </div>
  );
};

export default Overview;
