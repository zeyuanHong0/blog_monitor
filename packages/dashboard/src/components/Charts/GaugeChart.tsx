import EChartsWrapper from "./EChartsWrapper";
import React, { type CSSProperties } from "react";
import type { EChartsOption } from "echarts";

interface GaugeChartProps {
  title: string;
  value: number;
  unit: string;
  thresholds: [number, number]; // [good/needImprovement, needImprovement/bad]
  max: number;
  loading?: boolean;
  style?: CSSProperties;
}

const colorMap = {
  good: "#5AD8A6",
  needImprovement: "#F6BD16",
  bad: "#E86452",
};

function getValueColor(value: number, thresholds: [number, number]): string {
  if (value <= thresholds[0]) return colorMap.good;
  if (value <= thresholds[1]) return colorMap.needImprovement;
  return colorMap.bad;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  unit,
  thresholds,
  max,
  loading,
  style,
}) => {
  const currentColor = getValueColor(value, thresholds);

  const option: EChartsOption = {
    series: [
      {
        type: "gauge",
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: max,
        progress: {
          show: true,
          width: 14,
          itemStyle: {
            color: currentColor,
          },
        },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [thresholds[0] / max, colorMap.good],
              [thresholds[1] / max, colorMap.needImprovement],
              [1, colorMap.bad],
            ],
            opacity: 0.15,
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        pointer: {
          show: false,
        },
        title: {
          show: true,
          offsetCenter: [0, "-20%"],
          fontSize: 14,
          fontWeight: "normal",
          color: "#666",
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, "20%"],
          fontSize: 22,
          fontWeight: "bold",
          color: currentColor,
          formatter: `{value}${unit}`,
        },
        data: [
          {
            value: value,
            name: title,
          },
        ],
      },
    ],
  };

  return <EChartsWrapper option={option} style={style} loading={loading} />;
};

export default GaugeChart;
