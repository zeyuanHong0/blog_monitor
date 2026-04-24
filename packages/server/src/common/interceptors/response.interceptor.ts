import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const method = request.method;

    const defaultMsgMap = {
      GET: '获取成功',
      POST: '创建成功',
      PUT: '更新成功',
      DELETE: '删除成功',
    };

    return next.handle().pipe(
      map((responseData) => {
        const { data, message, code } =
          responseData && typeof responseData === 'object'
            ? responseData
            : { data: responseData };

        return {
          code: code ?? 200,
          message: message ?? defaultMsgMap[method] ?? '操作成功',
          data,
        };
      }),
    );
  }
}
