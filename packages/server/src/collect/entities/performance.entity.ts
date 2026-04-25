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
export class Performance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  appId!: string;

  @Column()
  url!: string;

  @Column('float', { nullable: true, comment: '首次内容绘制时间 FCP' })
  fcp!: number;

  @Column('float', { nullable: true, comment: '最大内容绘制时间 LCP' })
  lcp!: number;

  @Column('float', { nullable: true, comment: '首次输入延迟 FID' })
  fid!: number;

  @Column('float', { nullable: true, comment: '累计布局偏移 CLS' })
  cls!: number;

  @Column('float', { nullable: true, comment: '首字节时间 TTFB' })
  ttfb!: number;

  @Column()
  sessionId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime!: Date;
}
