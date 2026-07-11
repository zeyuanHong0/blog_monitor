import EChartsWrapper from "./EChartsWrapper";
import React, { type CSSProperties } from "react";
import type { EChartsOption } from "echarts";

interface BarChartProps {
  xData: string[];
  data: number[];
  name?: string;
  color?: string;
  style?: CSSProperties;
  loading?: boolean;
}

const emptyGraphic = {
  type: "group",
  left: "center",
  top: "center",
  children: [
    {
      type: "text",
      style: {
        text: "暂无数据",
        fill: "#bfbfbf",
        fontSize: 14,
        fontWeight: 400,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
    },
  ],
};

const BarChart: React.FC<BarChartProps> = ({
  xData,
  data,
  name = "数量",
  color = "#5B8FF9",
  style,
  loading,
}) => {
  if (xData.length === 0 || data.length === 0) {
    const option: EChartsOption = {
      graphic: emptyGraphic as any,
    };
    return (
      <EChartsWrapper
        option={option}
        style={{ height: 220, ...style }}
        loading={loading}
      />
    );
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.96)",
      textStyle: { color: "#333" },
      extraCssText: "box-shadow: 0 4px 20px rgba(0,0,0,0.08);",
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "8%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#999", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: "#f0f0f0", type: "dashed" },
      },
      axisLabel: { color: "#999" },
    },
    series: [
      {
        name,
        type: "bar",
        data,
        barMaxWidth: 32,
        itemStyle: {
          color,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return (
    <EChartsWrapper
      option={option}
      style={{ height: 220, ...style }}
      loading={loading}
    />
  );
};

export default BarChart;
