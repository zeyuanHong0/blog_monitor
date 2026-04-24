import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from '@/common/dayjs.config';

@Injectable()
export class FormattedDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        // console.log('Interceptor', value);
        return this.formatDates(value);
      }),
    );
  }

  private formatDates(value: unknown): unknown {
    if (value === null || value === undefined) return value;

    // 日期
    if (value instanceof Date) {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    }

    // 数组
    if (Array.isArray(value)) {
      return value.map((v) => this.formatDates(v));
    }

    // 对象
    if (typeof value === 'object') {
      const obj = {};
      for (const key of Object.keys(value)) {
        obj[key] = this.formatDates(value[key]);
      }
      return obj;
    }

    // 基础类型
    return value;
  }
}
