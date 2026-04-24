import { ValueTransformer } from 'typeorm';
import dayjs from '@/common/dayjs.config';

/**
 * 通用的时间格式化 Transformer
 * @param format 输出格式（默认 'YYYY-MM-DD HH:mm:ss'）
 */
export const createDateTransformer = (
  format = 'YYYY-MM-DD HH:mm:ss',
): ValueTransformer => ({
  to: (value: Date | null) => value, // 保存时原样存储
  from: (value: Date | string | null) =>
    value ? dayjs(value).format(format) : value, // 查询时格式化
});
