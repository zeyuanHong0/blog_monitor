export enum ErrorType {
  JS = 'js', // 同步运行时错误
  PROMISE = 'promise', // 未捕获 Promise
  RESOURCE = 'resource', // 静态资源加载失败
  AJAX = 'ajax', // 有响应（4xx / 5xx）
  NETWORK = 'network', // 无响应（timeout / 断网）
  FRAMEWORK = 'framework', // 框架错误（React/Vue）
  CUSTOM = 'custom', // 手动上报
  UNKNOWN = 'unknown', // 未知错误
}
