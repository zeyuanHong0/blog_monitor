import { useCallback, useEffect, useMemo, useState } from "react";

import type { Preset } from "@/constants";
import { getDefaultRange } from "@/utils/dateRange";
import { getSessionStorage, setSessionStorage } from "@/utils/storage";

const VALID_PRESETS: Preset[] = ["today", "7d", "30d", "90d", "custom"];

type DateFilterState = {
  preset: Preset;
  dateRange: [string, string];
};

type UseDateFilterSessionStorageOptions = {
  storageKey: string;
  defaultPreset?: Exclude<Preset, "custom">;
};

const isPreset = (value: unknown): value is Preset => {
  return typeof value === "string" && VALID_PRESETS.includes(value as Preset);
};

const isRange = (value: unknown): value is [string, string] => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string"
  );
};

const readFromSessionStorage = (
  key: string,
  fallbackPreset: Exclude<Preset, "custom">,
): DateFilterState => {
  const fallback: DateFilterState = {
    preset: fallbackPreset,
    dateRange: getDefaultRange(fallbackPreset),
  };

  const raw = getSessionStorage(key);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<DateFilterState>;
    if (!isPreset(parsed.preset) || !isRange(parsed.dateRange)) {
      return fallback;
    }
    if (parsed.preset === "custom") {
      return { preset: "custom", dateRange: parsed.dateRange };
    }
    return {
      preset: parsed.preset,
      dateRange: getDefaultRange(parsed.preset),
    };
  } catch {
    return fallback;
  }
};

export const useDateFilterSessionStorage = ({
  storageKey,
  defaultPreset = "today",
}: UseDateFilterSessionStorageOptions) => {
  const storageEntryKey = useMemo(
    () => `dashboard:date-filter:${storageKey}`,
    [storageKey],
  );
  const [state, setState] = useState<DateFilterState>(() =>
    readFromSessionStorage(storageEntryKey, defaultPreset),
  );

  useEffect(() => {
    setSessionStorage(storageEntryKey, JSON.stringify(state));
  }, [state, storageEntryKey]);

  const onDateChange = useCallback(
    (dateRange: [string, string], preset: Preset) => {
      console.log("Date range changed:", { dateRange, preset });
      setState({ dateRange, preset });
    },
    [],
  );

  return {
    preset: state.preset,
    dateRange: state.dateRange,
    onDateChange,
  };
};
