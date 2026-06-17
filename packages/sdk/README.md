# web-observer-sdk

面向 Web 应用的前端监控 SDK，提供页面浏览、性能监控、错误捕获和自定义事件追踪能力。

## 安装

```bash
npm install web-observer-sdk
```

## 使用

```ts
import { WebMonitor } from 'web-observer-sdk';

// 初始化
WebMonitor.init({
  reportUrl: 'https://your-server.com/api/report',
  appId: 'your-app-id',
  enablePerformance: true,
  enableError: true,
  sampleRate: 1.0,
});

// 手动上报自定义事件
WebMonitor.track('button_click', { buttonName: 'login' });

// 手动上报错误
WebMonitor.reportError(new Error('自定义错误'), { module: 'payment' });

// 销毁实例
WebMonitor.destroy();
```

## API

### WebMonitor.init(config: MonitorConfig)

初始化监控 SDK。

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `reportUrl` | `string` | 上报地址 | 必填 |
| `appId` | `string` | 应用 ID | 必填 |
| `enablePerformance` | `boolean` | 开启性能监控 | `true` |
| `enableError` | `boolean` | 开启错误监控 | `true` |
| `enableSoftNavigation` | `boolean` | 开启软导航监控 | `false` |
| `sampleRate` | `number` | 采样率 (0-1) | `1.0` |
| `maxBatchSize` | `number` | 批量上报最大条数 | `10` |
| `flushInterval` | `number` | 上报间隔 (ms) | `5000` |
| `maxRetries` | `number` | 最大重试次数 | `3` |

### WebMonitor.track(eventName: string, data?: Record<string, any>)

手动上报自定义事件。

### WebMonitor.reportError(error: Error \| string, metadata?: Record<string, any>)

手动上报自定义错误。

### WebMonitor.destroy()

销毁监控实例，停止所有收集器并刷新剩余数据。
