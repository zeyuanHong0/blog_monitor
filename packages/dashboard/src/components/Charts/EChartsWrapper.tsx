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

  // 等待下一帧初始化图表
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      if (chartRef.current) {
        instanceRef.current = echarts.init(chartRef.current, theme);
        if (optionRef.current) {
          instanceRef.current.setOption(optionRef.current, true);
        }
        if (loading) {
          instanceRef.current.showLoading();
        }
      }
    });
    return () => {
      cancelAnimationFrame(rafId);
      instanceRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // option 更新
  useEffect(() => {
    optionRef.current = option;
    if (instanceRef.current) {
      instanceRef.current.setOption(option, true);
    }
  }, [option]);

  // 监听窗口 resize 事件
  useEffect(() => {
    let skipFirst = true;
    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(() => {
      if (skipFirst) {
        skipFirst = false;
        return;
      }
      handleResize();
    });
    if (chartRef.current) observer.observe(chartRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);
  // loading 状态
  useEffect(() => {
    if (!instanceRef.current) return;
    if (loading) {
      instanceRef.current.showLoading();
    } else {
      instanceRef.current.hideLoading();
    }
  }, [loading]);
  // theme 切换
  useEffect(() => {
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
