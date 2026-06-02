import dayjs, { Dayjs } from "dayjs";
import type { Preset } from "@/constants";

// 时间范围解析
export const resolveRange = (
  preset: Exclude<Preset, "custom">,
): [Dayjs, Dayjs] => {
  const end = dayjs().endOf("day");
  switch (preset) {
    case "today":
      return [dayjs().startOf("day"), end];
    case "7d":
      return [dayjs().subtract(6, "day").startOf("day"), end];
    case "30d":
      return [dayjs().subtract(29, "day").startOf("day"), end];
    case "90d":
      return [dayjs().subtract(89, "day").startOf("day"), end];
  }
};

// 获取默认时间范围
export const getDefaultRange = (
  preset: Exclude<Preset, "custom"> = "today",
): [string, string] => {
  const [start, end] = resolveRange(preset);
  return [start.toISOString(), end.toISOString()];
};
