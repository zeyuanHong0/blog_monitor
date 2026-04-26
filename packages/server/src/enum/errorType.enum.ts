export enum ErrorType {
  JS = 'js', // 原生运行时错误
  PROMISE = 'promise', // 未捕获 Promise
  REACT = 'react', // React 组件错误
  AJAX = 'ajax', // 接口返回错误（4xx / 5xx）
  NETWORK = 'network', // 网络错误（断网 / timeout）
  RESOURCE = 'resource', // 静态资源加载失败
  CUSTOM = 'custom', // 业务手动上报
}
