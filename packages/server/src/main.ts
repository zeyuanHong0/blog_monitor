import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger)); //使用nestjs-pino作为日志记录器
  app.use(cookieParser()); // 启用 cookie-parser
  app.enableCors({
    origin: true,
    credentials: true, // 允许携带 cookie
  });
  app.setGlobalPrefix('api'); //设置全局前缀为 'api'
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去除非 DTO 定义的属性
    }),
  );
  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();
