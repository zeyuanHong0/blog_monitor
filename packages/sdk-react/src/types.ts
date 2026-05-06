/**
 * @blog-monitor/react 类型定义
 * 核心类型从 @blog-monitor/sdk 导入
 */
import type React from 'react';
export type { ErrorCollector, ErrorData, Framework, ErrorType } from '@blog-monitor/sdk';

/** BlogMonitor SDK 实例接口（挂载到 window 上的全局对象） */
export interface BlogMonitorSDKGlobal {
  reportError(error: Error | string, metadata?: Record<string, any>): void;
}

/** MonitorErrorBoundary 的 Props 定义 */
export interface MonitorErrorBoundaryProps {
  /** 出错时显示的 UI */
  fallback?: React.ReactNode;
  /** 额外的错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** 子组件 */
  children: React.ReactNode;
  /** 直接传入 BlogMonitor SDK 实例（优先级高于全局获取） */
  reporter?: BlogMonitorSDKGlobal;
}

/** MonitorErrorBoundary 的 State 定义 */
export interface MonitorErrorBoundaryState {
  hasError: boolean;
}
