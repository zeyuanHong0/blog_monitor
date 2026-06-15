import { useState } from "react";
import { Select, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { DATE_RANGE_PRESETS, type Preset } from "@/constants";
import { resolveRange } from "@/utils/dateRange";

const { RangePicker } = DatePicker;

interface DateSelectProps {
  onChange: (value: [string, string], preset: Preset) => void;
  defaultPreset?: Preset;
  /** 受控模式：外部控制 preset 值 */
  preset?: Preset;
  /** 受控模式：外部控制日期范围值 */
  value?: [string, string];
}

export const DateSelect: React.FC<DateSelectProps> = ({
  onChange,
  defaultPreset = "today",
  preset: controlledPreset,
  value,
}) => {
  const [internalPreset, setInternalPreset] = useState<Preset>(defaultPreset);
  const [isCustom, setIsCustom] = useState(controlledPreset === "custom");
  const preset = controlledPreset ?? internalPreset;
  const setPreset = (value: Preset) => {
    if (controlledPreset === undefined) {
      setInternalPreset(value);
    }
  };

  const handlePresetChange = (value: Preset) => {
    setPreset(value);
    if (value !== "custom") {
      setIsCustom(false);
      const [start, end] = resolveRange(value);
      onChange([start.toISOString(), end.toISOString()], value);
    } else {
      // 切换到自定义：先显示 RangePicker，等用户选完日期再触发 onChange
      setIsCustom(true);
    }
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates?.[0] && dates?.[1]) {
      onChange(
        [
          dates[0].startOf("day").toISOString(),
          dates[1].endOf("day").toISOString(),
        ],
        "custom",
      );
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Select
        value={isCustom ? "custom" : preset}
        style={{ width: 140 }}
        onChange={handlePresetChange}
        options={DATE_RANGE_PRESETS}
      />
      {isCustom && (
        <RangePicker
          value={value ? [dayjs(value[0]), dayjs(value[1])] : null}
          onChange={handleRangeChange}
        />
      )}
    </div>
  );
};

export default DateSelect;
