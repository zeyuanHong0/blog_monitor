import React from "react";
import { BlogMonitor } from "@blog-monitor/sdk";
import type {
  MonitorErrorBoundaryProps,
  MonitorErrorBoundaryState,
  BlogMonitorSDKGlobal,
} from "./types";

declare global {
  interface Window {
    __BLOG_MONITOR_SDK__?: BlogMonitorSDKGlobal;
  }
}

/**
 * 从全局获取 BlogMonitor SDK 实例
 * SDK 初始化后会挂载到 window.__BLOG_MONITOR_SDK__
 */
function getSDKInstance(): BlogMonitorSDKGlobal | null {
  if (typeof window !== "undefined" && window.__BLOG_MONITOR_SDK__) {
    return window.__BLOG_MONITOR_SDK__;
  }
  // 回退使用导入的 BlogMonitor 单例
  return BlogMonitor as unknown as BlogMonitorSDKGlobal;
}

/**
 * 从 React componentStack 中解析“最外层（最近）组件名”
 *
 * 注意：
 * 1. componentStack 是 React 提供的调试字符串，不是稳定 API
 * 2. 不同环境格式可能不同（开发 / 生产 / 压缩后）
 * 3. 组件名可能被压缩（如 a、t），甚至不存在（匿名组件）
 *
 * 常见格式示例：
 *   "\n    at Button (src/Button.tsx:10)\n    at App (src/App.tsx:20)"
 *
 * 解析策略：
 *   - 取第一行 "at xxx"
 *   - 提取 xxx（组件名）
 */
function parseComponentName(
  componentStack?: string | null,
): string | undefined {
  if (!componentStack) return;
  // 取第一行有效栈
  const firstLine = componentStack.trim().split("\n")[0];
  // 提取 "at xxx"
  const match = firstLine.match(/at\s+([^\s(]+)/);
  return match?.[1];
}

/**
 * 是否允许报送错误（防止重复报送）
 */
let lastErrorMsg = "";
let lastReportTime = 0;
function shouldReport(error: Error): boolean {
  const now = Date.now();
  if (error.message === lastErrorMsg && now - lastReportTime < 2000)
    return false;
  lastErrorMsg = error.message;
  lastReportTime = now;
  return true;
}

/**
 * React 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，并上报到监控系统
 */
export class MonitorErrorBoundary extends React.Component<
  MonitorErrorBoundaryProps,
  MonitorErrorBoundaryState
> {
  constructor(props: MonitorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): MonitorErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 解析最近一层组件名
    const componentName = parseComponentName(errorInfo.componentStack);

    // 获取 SDK 实例：优先使用 prop 传入的 reporter，其次通过全局方法获取
    const sdk = this.props.reporter || getSDKInstance();

    if (sdk && shouldReport(error)) {
      // 调用 SDK 的 reportError
      sdk.reportError(error, {
        framework: {
          name: "react" as const,
          componentName,
          componentStack: errorInfo.componentStack || undefined,
        },
      });
    } else {
      console.warn("[blog-monitor/react] SDK 未初始化，无法上报错误");
    }

    // 调用额外的错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * 重置错误状态，允许重新渲染子组件
   */
  resetError = (): void => {
    this.setState({ hasError: false });
  };

  /**
   * 当 children 的 key 变化时，自动重置错误状态
   */
  componentDidUpdate(prevProps: MonitorErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // 出错时渲染 fallback，如果没有提供则渲染 null
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
