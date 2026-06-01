import React from "react";
import { theme } from "antd";

import styles from "./index.module.scss";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    text: string;
  };
}

const StatCard: React.FC<StatCardProps> = (props) => {
  const { title, value, icon, trend } = props;
  const { token } = theme.useToken();
  return (
    <div
      className={styles.statCard}
      style={{
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
      }}
    >
      <div className={styles.header}>
        <span className={styles.title} style={{ color: token.colorText }}>
          {title}
        </span>
        {icon && (
          <span
            className={styles.icon}
            style={{ color: token.colorTextSecondary }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className={styles.value} style={{ color: token.colorText }}>
        {value}
      </div>
      {trend && (
        <div
          className={styles.trend}
          style={{ color: token.colorTextSecondary }}
        >
          {trend.text}
        </div>
      )}
    </div>
  );
};

export default StatCard;
