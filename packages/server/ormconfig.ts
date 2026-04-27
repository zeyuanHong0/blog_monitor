import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { ConfigEnum } from '@/enum/config.enum';

import { User } from '@/user/entities/user.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';
import { MonitorEvent } from '@/collect/entities/event.entity';
import { Heartbeat } from '@/heartbeat/entities/heartbeat.entity';
import { DailyStat } from '@/aggregate/entities/daily-stat.entity';

// 通过环境变量读取不同的.env文件
function getEnv(env: string): Record<string, any> {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env));
  }
  return {};
}

// 通过dotenv解析.env文件
function buildConnectionOptions(): TypeOrmModuleOptions {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`);
  const env = { ...defaultConfig, ...envConfig };
  return {
    type: 'mysql',
    timezone: '+08:00',
    host: env[ConfigEnum.DB_HOST],
    port: Number(env[ConfigEnum.DB_PORT]),
    username: env[ConfigEnum.DB_USERNAME],
    password: env[ConfigEnum.DB_PASSWORD],
    database: env[ConfigEnum.DB_NAME],
    entities: [
      User,
      PageView,
      Performance,
      MonitorError,
      MonitorEvent,
      Heartbeat,
      DailyStat,
    ],
    synchronize: false, // 注意:在生产环境中不要使用 synchronize: true
    migrations: [
      process.env.NODE_ENV === 'production'
        ? 'dist/src/migrations/*.js' // 生产环境用编译后的
        : 'src/migrations/*.ts', // 开发环境用源码
    ],
    // logging: ['query', 'error'], // 日志
  };
}

export const connectionParams = buildConnectionOptions();

export default new DataSource({
  ...connectionParams,
  migrations: [
    process.env.NODE_ENV === 'production'
      ? 'dist/src/migrations/*.js' // 生产环境用编译后的
      : 'src/migrations/*.ts', // 开发环境用源码
  ],
  subscribers: [],
} as DataSourceOptions);
