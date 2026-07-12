# blog_monitor

一个前端性能与错误监控的 monorepo，包含监控 SDK、React 封装、服务端接口和管理后台。

## 项目结构

- `packages/sdk`：Web 监控 SDK
- `packages/sdk-react`：React 错误边界封装
- `packages/server`：NestJS 数据接收与管理接口
- `packages/dashboard`：React + Vite 管理后台

## 安装

```bash
npm install
```

## 开发

分别进入对应包目录启动：

```bash
# 服务端
cd packages/server
npm run start:dev

# 管理后台
cd packages/dashboard
npm run dev
```

## 说明

- 根目录使用 npm workspaces 管理子包
- 监控数据默认由前端 SDK 上报到服务端，再由后台查看和分析
