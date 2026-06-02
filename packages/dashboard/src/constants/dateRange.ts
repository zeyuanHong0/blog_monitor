export type Preset = "today" | "7d" | "30d" | "90d" | "custom";

export const DATE_RANGE_PRESETS: { label: string; value: Preset }[] = [
  { label: "今天", value: "today" },
  { label: "最近 7 天", value: "7d" },
  { label: "最近 30 天", value: "30d" },
  { label: "最近 90 天", value: "90d" },
  { label: "自定义", value: "custom" },
];
