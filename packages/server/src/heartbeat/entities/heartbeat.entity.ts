import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'heartbeats', comment: '站点/接口心跳监控表（可用性检测）' })
@Index(['targetUrl', 'checkTime'])
@Index(['targetUrl', 'isUp'])
export class Heartbeat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '目标URL（站点或接口地址）' })
  targetUrl!: string;

  @Column({ nullable: true, comment: 'HTTP状态码' })
  statusCode?: number;

  @Column('float', { comment: '响应时间（毫秒）' })
  responseTime!: number;

  @Column({ type: 'datetime', nullable: true, comment: 'SSL证书过期时间' })
  sslExpiry?: Date;

  @Column({ default: true, comment: '是否可用（true=正常，false=异常）' })
  isUp!: boolean;

  @Column({ nullable: true, comment: '错误信息（失败时记录）' })
  errorMessage?: string;

  @CreateDateColumn({ type: 'datetime', comment: '检测时间' })
  checkTime!: Date;
}
