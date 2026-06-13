import { useState } from "react";
import { Select, DatePicker } from "antd";
import { Dayjs } from "dayjs";

import { DATE_RANGE_PRESETS, type Preset } from "@/constants";
import { resolveRange } from "@/utils/dateRange";

const { RangePicker } = DatePicker;

interface DateSelectProps {
  onChange: (value: [string, string]) => void;
  defaultPreset?: Preset;
}

export const DateSelect: React.FC<DateSelectProps> = ({
  onChange,
  defaultPreset = "today",
}) => {
  const [preset, setPreset] = useState<Preset>(defaultPreset);
  const handleChange = (value: Preset) => {
    setPreset(value);
    if (value !== "custom") {
      const [start, end] = resolveRange(value);
      onChange([start.toISOString(), end.toISOString()]);
    }
  };
  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates?.[0] && dates?.[1]) {
      onChange([
        dates[0].startOf("day").toISOString(),
        dates[1].endOf("day").toISOString(),
      ]);
    }
  };
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Select
        value={preset}
        style={{ width: 140 }}
        onChange={handleChange}
        options={DATE_RANGE_PRESETS}
      />
      {preset === "custom" && <RangePicker onChange={handleRangeChange} />}
    </div>
  );
};

export default DateSelect;
