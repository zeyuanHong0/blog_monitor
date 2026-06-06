import React from "react";
import { Progress, Tag, theme } from "antd";

import styles from "./index.module.scss";

interface VitalCardProps {
  title: string;
  description: string;
  value: number;
  unit: string;
  thresholds: [number, number];
  max: number;
}

function getStatus(value: number, thresholds: [number, number]) {
  if (value <= thresholds[0]) return "good";
  if (value <= thresholds[1]) return "needs-improvement";
  return "poor";
}

const VitalCard: React.FC<VitalCardProps> = (props) => {
  const { title, description, value, unit, thresholds, max } = props;
  const { token } = theme.useToken();

  const status = getStatus(value, thresholds);
  const percent = Math.min((value / max) * 100, 100);

  const strokeColorMap = {
    good: token.colorSuccess,
    "needs-improvement": token.colorWarning,
    poor: token.colorError,
  };

  const tagColorMap = {
    good: "success",
    "needs-improvement": "warning",
    poor: "error",
  } as const;

  const tagLabelMap = {
    good: "Good",
    "needs-improvement": "Needs Improvement",
    poor: "Poor",
  };

  const strokeColor = strokeColorMap[status];
  const displayValue = Number.isInteger(value) ? value : value.toFixed(2);

  return (
    <div
      className={styles.vitalCard}
      style={{
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
      }}
    >
      <div className={styles.header}>
        <span className={styles.title} style={{ color: token.colorText }}>
          {title}
        </span>
        <Tag color={tagColorMap[status]} bordered>
          {tagLabelMap[status]}
        </Tag>
      </div>
      <div className={styles.description} style={{ color: token.colorTextSecondary }}>
        {description}
      </div>
      <div className={styles.valueSection}>
        <span className={styles.value} style={{ color: strokeColor }}>
          {displayValue}
        </span>
        {unit && (
          <span className={styles.unit} style={{ color: strokeColor }}>
            {unit}
          </span>
        )}
      </div>
      <div className={styles.progressWrapper}>
        <Progress
          percent={percent}
          strokeColor={strokeColor}
          showInfo={false}
          strokeLinecap="round"
          size="small"
        />
      </div>
      <div className={styles.footer} style={{ color: token.colorTextSecondary }}>
        阈值: {thresholds[0]} / {thresholds[1]}
        {unit && ` ${unit}`}
      </div>
    </div>
  );
};

export default VitalCard;
