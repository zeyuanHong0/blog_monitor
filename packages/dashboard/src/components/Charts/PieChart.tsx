import EChartsWrapper from "./EChartsWrapper";
import React, { type CSSProperties } from "react";
import type { EChartsOption } from "echarts";

const defaultColors = [
  "#5B8FF9",
  "#5AD8A6",
  "#F6BD16",
  "#E86452",
  "#6DC8EC",
  "#945FB9",
];

interface PieChartProps {
  data: { name: string; value: number }[];
  title?: string;
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

const PieChart: React.FC<PieChartProps> = ({ data, title, style, loading }) => {
  if (!data || data.length === 0) {
    const option: EChartsOption = {
      title: title
        ? {
            text: title,
            left: "center",
            textStyle: { fontSize: 14, fontWeight: 500, color: "#333" },
          }
        : undefined,
      graphic: emptyGraphic as any,
    };
    return <EChartsWrapper option={option} style={style} loading={loading} />;
  }

  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          left: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: 500,
            color: "#333",
          },
        }
      : undefined,
    tooltip: {
      trigger: "item",
      borderWidth: 0,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.96)",
      textStyle: {
        color: "#333",
      },
      extraCssText: "box-shadow: 0 4px 20px rgba(0,0,0,0.08);",
    },
    legend: {
      orient: "horizontal",
      bottom: "0%",
      left: "center",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: "#666",
        fontSize: 12,
      },
    },
    color: defaultColors,
    animationDuration: 800,
    animationEasing: "cubicInOut",
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        padAngle: 2,
        data: data || [],
        itemStyle: {
          borderRadius: 6,
        },
        label: {
          show: true,
          formatter: "{b}: {d}%",
          fontSize: 12,
          color: "#666",
        },
        emphasis: {
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.15)",
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
      },
    ],
  };

  return <EChartsWrapper option={option} style={style} loading={loading} />;
};

export default PieChart;
