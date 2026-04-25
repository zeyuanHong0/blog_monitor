import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'page_views', comment: '页面访问记录表（PV/UV 埋点）' })
@Index(['appId', 'url'])
@Index(['appId', 'createTime'])
@Index(['appId', 'sessionId'])
export class PageView {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  appId!: string;

  @Column()
  url!: string;

  @Column({ nullable: true, comment: '来源页面（referrer）' })
  referrer?: string;

  @Column({ nullable: true, comment: '页面标题' })
  title?: string;

  @Column({ type: 'text', comment: '浏览器用户代理（UserAgent）' })
  userAgent!: string;

  @Column({ length: 45, nullable: true, comment: '用户IP' })
  ip?: string;

  @Column()
  sessionId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime!: Date;
}
