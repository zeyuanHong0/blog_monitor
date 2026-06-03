import EChartsWrapper from "./EChartsWrapper";
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";

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
    tooltip: { trigger: "axis" },
    legend: {
      data: series.map((s) => s.name),
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
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
    },
    series: series.map((s) => ({
      name: s.name,
      type: "line",
      smooth: true,
      data: s.data,
      itemStyle: s.color ? { color: s.color } : undefined,
    })),
  };

  return <EChartsWrapper option={option} style={style} loading={loading} />;
};

export default LineChart;
