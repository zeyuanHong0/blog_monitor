import EChartsWrapper from "./EChartsWrapper";
import * as echarts from "echarts";
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";

const defaultColors = [
  "#5B8FF9",
  "#5AD8A6",
  "#F6BD16",
  "#E86452",
  "#6DC8EC",
  "#945FB9",
];

interface Series {
  name: string;
  data: number[];
  color?: string;
}

interface LineChartProps {
  xData: string[];
  series: Series[];
  style?: CSSProperties;
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  xData,
  series,
  style,
  loading,
}) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.96)",
      textStyle: {
        color: "#333",
      },
      extraCssText:
        "box-shadow: 0 4px 20px rgba(0,0,0,0.08);",
    },
    legend: {
      data: series.map((s) => s.name),
      right: "4%",
      top: "0%",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: "#666",
        fontSize: 12,
      },
    },
    grid: {
      left: "3%",
      right: "6%",
      top: "14%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xData,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#999",
        interval: xData.length <= 14 ? 0 : xData.length <= 30 ? 1 : Math.floor(xData.length / 12),
        rotate: xData.length > 30 ? 30 : 0,
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#f0f0f0",
        },
      },
      axisLabel: {
        color: "#999",
      },
    },
    animationDuration: 1000,
    animationEasing: "cubicInOut",
    series: series.map((s, index) => {
      const color = s.color || defaultColors[index % defaultColors.length];
      return {
        name: s.name,
        type: "line" as const,
        smooth: true,
        showSymbol: false,
        symbolSize: 8,
        data: s.data,
        lineStyle: {
          width: 2.5,
          color,
          shadowBlur: 4,
          shadowOffsetY: 2,
          shadowColor: `${color}40`,
        },
        itemStyle: {
          color,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}30` },
            { offset: 1, color: `${color}05` },
          ]),
        },
      };
    }),
  };

  return <EChartsWrapper option={option} style={style} loading={loading} />;
};

export default LineChart;
