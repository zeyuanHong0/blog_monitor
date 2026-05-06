import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ErrorType } from '@/enum/errorType.enum';

@Entity({
  name: 'errors',
  comment: '前端异常监控表',
})
@Index(['appId', 'createTime'])
@Index(['appId', 'errorType'])
@Index(['appId', 'url'])
@Index(['appId', 'sessionId'])
export class MonitorError {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  appId!: string;

  @Column({
    type: 'enum',
    enum: ErrorType,
    comment: '错误类型',
  })
  errorType!: string;

  @Column('text', { comment: '错误信息' })
  message!: string;

  @Column('text', { nullable: true, comment: '错误堆栈信息' })
  stack?: string;

  @Column({ nullable: true, comment: '报错文件名' })
  filename?: string;

  @Column({ nullable: true, comment: '报错行号' })
  lineno?: number;

  @Column({ nullable: true, comment: '报错列号' })
  colno?: number;

  @Column({ nullable: true, comment: '资源加载失败的URL' })
  resourceUrl?: string;

  @Column('json', { nullable: true, comment: '框架错误信息' })
  framework?: {
    name: 'react' | 'vue';
    componentName?: string;
    componentStack?: string;
    hook?: string;
  };

  @Column()
  url!: string;

  @Column()
  sessionId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime!: Date;
}
