import axios from "axios";
import { message } from "antd";
import useUserStore from "@/store/userStore";

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API as string,
  timeout: 10000 * 6,
  withCredentials: true, // 允许携带 cookie
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 处理业务状态码
    const res = response.data;
    if (res.code !== 200) {
      message.error(res.message || "请求出错");
      return Promise.reject(new Error(res.message || "请求出错"));
    }
    return res;
  },
  (error) => {
    const { setLoginExpired } = useUserStore.getState();
    // 处理 HTTP 层面的错误
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 先判断是否登录过期
      if (status === 401) {
        message.info("登录已过期，请重新登录");
        setLoginExpired(true);
        return Promise.reject(error);
      }

      // 优先使用后端返回的错误信息
      if (data && data.message) {
        const msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
        message.error(msg);
        return Promise.reject(error);
      }

      // 如果后端没有返回 message，使用默认提示
      switch (status) {
        case 400:
          message.error("请求参数错误");
          break;
        case 403:
          message.error("没有权限访问");
          break;
        case 404:
          message.error("请求资源不存在");
          break;
        case 500:
          message.error("服务器内部错误");
          break;
        default:
          message.error(`请求错误：${status}`);
      }
    } else if (error.request) {
      message.error("请求超时或网络错误");
    } else {
      message.error(error.message);
    }
    return Promise.reject(error);
  },
);

export default request;
