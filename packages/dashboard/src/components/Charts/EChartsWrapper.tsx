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
  const mountTimeRef = useRef(0);

  useEffect(() => {
    if (chartRef.current) {
      instanceRef.current = echarts.init(chartRef.current, theme);
      mountTimeRef.current = Date.now();
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
    const safeResize = () => {
      if (Date.now() - mountTimeRef.current < 1200) return;
      instanceRef.current?.resize();
    };

    window.addEventListener("resize", safeResize);
    const observer = new ResizeObserver(safeResize);
    if (chartRef.current) observer.observe(chartRef.current);

    return () => {
      window.removeEventListener("resize", safeResize);
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
      mountTimeRef.current = Date.now();
      instanceRef.current.setOption(optionRef.current, true);
    }
  }, [theme]);
  return (
    <div ref={chartRef} style={{ width: "100%", height: 200, ...style }} />
  );
};

export default EChartsWrapper;
