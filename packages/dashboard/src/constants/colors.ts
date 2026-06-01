/** 卡片主题色类型 */
export type CardType = "primary" | "purple" | "danger" | "success" | "warning";

/** 趋势状态类型 */
export type TrendType = "up" | "down" | "good" | "warning";

export const accentColorMap: Record<CardType, string> = {
  primary: "#1677FF", // PV - 蓝色
  purple: "#722ED1", // UV - 紫色
  danger: "#FF4D4F", // 错误 - 红色
  success: "#52C41A", // LCP良好 - 绿色
  warning: "#FA8C16", // SSL等 - 橙色
};

export const trendColorMap: Record<TrendType, string> = {
  up: "#52C41A", // 正面上升（如 PV 增长）
  down: "#FF4D4F", // 负面下降（如 UV 下降）
  good: "#52C41A", // 正面状态（如"良好 ✓"）
  warning: "#FF4D4F", // 告警状态（如"需关注"）
};
