import { type CSSProperties, useRef, useEffect } from "react";
import type { EChartsOption } from "echarts";
import * as echarts from "echarts";

interface EChartsWrapperProps {
  option: EChartsOption;
  style?: CSSProperties;
  loading?: boolean;
  theme?: "light" | "dark";
}

const EChartsWrapper: React.FC<EChartsWrapperProps> = ({
  option,
  style,
  loading,
  theme,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const optionRef = useRef(option);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (chartRef.current) {
      instanceRef.current = echarts.init(chartRef.current, theme);
    }
    return () => {
      instanceRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (instanceRef.current && option) {
      optionRef.current = option;
      instanceRef.current.setOption(option, true);
    }
  }, [option]);
  useEffect(() => {
    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(() => instanceRef.current?.resize());
    if (chartRef.current) observer.observe(chartRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (loading) {
      instanceRef.current?.showLoading();
    } else {
      instanceRef.current?.hideLoading();
    }
  }, [loading]);
  useEffect(() => {
    // 首次挂载时不要执行
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (instanceRef.current && theme) {
      instanceRef.current.dispose();
      instanceRef.current = echarts.init(chartRef.current!, theme);
      instanceRef.current.setOption(optionRef.current, true);
    }
  }, [theme]);
  return (
    <div ref={chartRef} style={{ width: "100%", height: 200, ...style }} />
  );
};

export default EChartsWrapper;
