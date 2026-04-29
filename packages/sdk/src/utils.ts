import { MonitorContext } from "./types";

/**
 * 生成唯一的会话ID
 * @returns 会话ID字符串
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

/**
 * 返回当前页面的URL和标题
 * @returns 包含URL和标题的对象
 */
export const getPageInfo = () => {
  return {
    url: window.location.href,
    title: document.title,
  };
};

/**
 * 返回浏览器/设备基本信息字符串
 * @returns 包含浏览器、操作系统和设备类型的字符串
 */
export const parseUserAgent = (): string => {
  const ua = navigator.userAgent;

  let browser = "Unknown Browser";
  if (/Firefox\/(\S+)/.test(ua)) {
    browser = `Firefox ${RegExp.$1}`;
  } else if (/Edg\/(\S+)/.test(ua)) {
    browser = `Edge ${RegExp.$1}`;
  } else if (/Chrome\/(\S+)/.test(ua)) {
    browser = `Chrome ${RegExp.$1}`;
  } else if (/Safari\/(\S+)/.test(ua) && /Version\/(\S+)/.test(ua)) {
    browser = `Safari ${RegExp.$1}`;
  }

  let device = "Desktop";
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
    device = /iPad/i.test(ua) ? "Tablet" : "Mobile";
  }

  let os = "Unknown OS";
  if (/Windows NT ([\d.]+)/.test(ua)) {
    os = `Windows ${RegExp.$1}`;
  } else if (/Mac OS X ([\d_]+)/.test(ua)) {
    os = `macOS ${RegExp.$1.replace(/_/g, ".")}`;
  } else if (/Android ([\d.]+)/.test(ua)) {
    os = `Android ${RegExp.$1}`;
  } else if (/iPhone OS ([\d_]+)/.test(ua)) {
    os = `iOS ${RegExp.$1.replace(/_/g, ".")}`;
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  return `${browser} | ${os} | ${device}`;
};

/**
 *
 * @param ctx
 * @returns 基础上报结构
 */
export const createBasedata = (ctx: MonitorContext) => {
  return {
    appId: ctx.config.appId,
    sessionId: ctx.sessionId,
    url: getPageInfo().url,
    userAgent: parseUserAgent(),
    timestamp: Date.now(),
  };
};
