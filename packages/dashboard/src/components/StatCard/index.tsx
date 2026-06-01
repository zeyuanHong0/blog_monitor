import React from "react";

import styles from "./index.module.scss";
import { accentColorMap, trendColorMap } from "@/constants/colors";
import type { CardType, TrendType } from "@/constants/colors";

interface StatCardProps {
  title: string;
  value: string | number;
  type: CardType;
  trend?: {
    text: string;
    type: TrendType;
  };
}

const StatCard: React.FC<StatCardProps> = (props) => {
  const { title, value, trend, type } = props;
  return (
    <div className={styles.statCard}>
      <div
        className={styles.line}
        style={{ backgroundColor: accentColorMap[type] }}
      ></div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
        {trend && (
          <div
            className={styles.trend}
            style={{ color: trendColorMap[trend.type] }}
          >
            {trend.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
