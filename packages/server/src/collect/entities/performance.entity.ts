import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('performances', { comment: '性能数据表' })
@Index(['appId', 'url'])
@Index(['appId', 'createTime'])
@Index(['appId', 'sessionId'])
@Index(['appId', 'navigationType', 'createTime'])
export class Performance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  appId!: string;

  @Column('enum', {
    enum: ['hard', 'soft'],
    default: 'hard',
    comment: '导航类型',
  })
  navigationType!: string;

  @Column({ comment: '页面 URL、导航目标URL' })
  url!: string;

  @Column({ nullable: true, comment: '软导航来源URL（首屏时为null）' })
  fromUrl!: string;

  @Column('float', { nullable: true, comment: '首次内容绘制时间 FCP' })
  fcp!: number;

  @Column('float', { nullable: true, comment: '最大内容绘制时间 LCP' })
  lcp!: number;

  @Column('float', { nullable: true, comment: '交互到下一帧绘制延迟 inp' })
  inp!: number;

  @Column('float', { nullable: true, comment: '累计布局偏移 CLS' })
  cls!: number;

  @Column('float', { nullable: true, comment: '首字节时间 TTFB' })
  ttfb!: number;

  @Column('float', {
    nullable: true,
    comment: '路由切换到内容就绪的耗时（首屏时为 null）',
  })
  navigationDuration!: number;

  @Column()
  sessionId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime!: Date;
}
