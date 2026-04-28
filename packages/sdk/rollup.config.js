import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts", // 入口文件
  output: [
    {
      file: "dist/sdk.min.js", // UMD 输出
      format: "umd",
      name: "BlogMonitor", // 挂在 window.BlogMonitor 上
      plugins: [terser()], // 压缩代码
    },
    {
      file: "dist/sdk.esm.js", // ESM 输出
      format: "es",
    },
  ],
  plugins: [
    typescript(), // 处理 TS → JS 的编译
  ],
};
