import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { QueryFailedError } from 'typeorm';

@Catch() // 捕获所有异常（HttpException + 数据库异常 + 其他 Error）
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = status;
    // 处理 token 过期或无效
    if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        code = (r.code as number) || status;
        message = (r.message as string) || '身份验证失败';
      }

      // 清除无效的 cookie
      response.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        domain: '',
      });

      this.logger.warn(
        {
          url: request.url,
          method: request.method,
          message,
        },
        'Unauthorized access attempt',
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        code = (r.code as number) || status;
        if (Array.isArray(r.message)) {
          message = r.message.join('; ');
        } else {
          message = r.message as string;
        }
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Database query failed: ${exception.message}`;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      {
        url: request.url,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
        exception,
      },
      'Unhandled exception',
    );

    // 如果响应已经发送（例如已经执行了 res.redirect），则不再尝试发送 JSON 响应
    if (response.headersSent) {
      return;
    }

    response.status(status).json({
      code: code,
      // path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
