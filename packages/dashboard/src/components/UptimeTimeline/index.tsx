import React from "react";
import { Tooltip } from "antd";

import styles from "./index.module.scss";

interface DayStatus {
  date: string; // YYYY-MM-DD
  status: "up" | "down" | "noData";
  description?: string;
}

interface UptimeTimelineProps {
  data: DayStatus[]; // 30 天数据
}

const STATUS_COLORS: Record<DayStatus["status"], string> = {
  up: "#69d9a1",       // 柔和的薄荷绿，不刺眼
  down: "#ff7875",     // 柔和的珊瑚红，温和警示
  noData: "#f0f0f0",   // 极浅灰，几乎不可见
};

const getStatusText = (status: DayStatus["status"]) => {
  switch (status) {
    case "up":
      return "正常";
    case "down":
      return "故障";
    case "noData":
      return "无数据";
  }
};

const UptimeTimeline: React.FC<UptimeTimelineProps> = ({ data }) => {
  return (
    <div className={styles.container}>
      {/* 方块容器 */}
      <div className={styles.barWrapper}>
        {data.map((item) => {
          const tooltipContent = (
            <span>
              {item.date} · {getStatusText(item.status)}
              {item.description && ` · ${item.description}`}
            </span>
          );
          return (
            <Tooltip key={item.date} title={tooltipContent}>
              <div
                className={styles.cell}
                style={{ backgroundColor: STATUS_COLORS[item.status] }}
              />
            </Tooltip>
          );
        })}
      </div>

      {/* 底部区域：时间指示 + 图例 */}
      <div className={styles.footer}>
        <span className={styles.timeLabel}>30 天前</span>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: STATUS_COLORS.up }}
            />
            <span className={styles.legendText}>正常</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: STATUS_COLORS.down }}
            />
            <span className={styles.legendText}>故障</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: STATUS_COLORS.noData }}
            />
            <span className={styles.legendText}>无数据</span>
          </div>
        </div>
        <span className={styles.timeLabel}>今天</span>
      </div>
    </div>
  );
};

export default UptimeTimeline;
