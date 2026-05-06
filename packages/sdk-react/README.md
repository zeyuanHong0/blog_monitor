# @blog-monitor/react

博客监控系统的 React 框架错误适配器，提供 `MonitorErrorBoundary` 错误边界组件，自动捕获并上报 React 组件树中的错误。

## 安装

```bash
npm install @blog-monitor/react @blog-monitor/sdk react
```

## 使用

### 基本用法

```tsx
import { MonitorErrorBoundary } from '@blog-monitor/react';

function App() {
  return (
    <MonitorErrorBoundary fallback={<div>页面出错了</div>}>
      <YourComponent />
    </MonitorErrorBoundary>
  );
}
```

### 带错误回调

```tsx
<MonitorErrorBoundary
  fallback={<div>出错了，请刷新页面</div>}
  onError={(error, errorInfo) => {
    console.error('捕获到错误:', error);
  }}
>
  <YourComponent />
</MonitorErrorBoundary>
```

### 手动传入 Reporter

```tsx
import { MonitorErrorBoundary } from '@blog-monitor/react';
import { getErrorCollector } from '@blog-monitor/sdk';

<MonitorErrorBoundary
  reporter={getErrorCollector()}
  fallback={<div>出错了</div>}
>
  <YourComponent />
</MonitorErrorBoundary>
```

### 重置错误状态

通过改变子组件的 `key` 来触发错误状态重置：

```tsx
const [resetKey, setResetKey] = useState(0);

<MonitorErrorBoundary
  fallback={<button onClick={() => setResetKey(k => k + 1)}>重试</button>}
>
  <YourComponent key={resetKey} />
</MonitorErrorBoundary>
```

## API

### MonitorErrorBoundaryProps

| 属性 | 类型 | 说明 |
|------|------|------|
| `children` | `React.ReactNode` | 子组件 |
| `fallback` | `React.ReactNode` | 出错时显示的 UI |
| `onError` | `(error, errorInfo) => void` | 额外的错误回调 |
| `reporter` | `IErrorCollector` | 手动传入错误收集器 |
