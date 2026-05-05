import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'daily_stats', comment: '每日统计汇总表（PV/UV/性能/错误）' })
export class DailyStat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'date', comment: '统计日期（YYYY-MM-DD）' })
  date!: string;

  @Column({ default: 0, comment: '页面访问量（PV）' })
  pv!: number;

  @Column({ default: 0, comment: '独立访客数（UV）' })
  uv!: number;

  @Column('float', { default: 0, comment: '平均首次内容绘制时间 FCP' })
  avgFcp!: number;

  @Column('float', { default: 0, comment: '平均最大内容绘制时间 LCP' })
  avgLcp!: number;

  @Column('float', { default: 0, comment: '平均交互到下一帧绘制延迟 inp' })
  avgInp!: number;

  @Column('float', { default: 0, comment: '平均布局偏移 CLS' })
  avgCls!: number;

  @Column({ default: 0, comment: '当日软导航次数' })
  softNavCount!: number;

  @Column('float', { default: 0, comment: '软导航平均LCP' })
  avgSoftNavLcp!: number;

  @Column('float', { default: 0, comment: '软导航平均耗时' })
  avgSoftNavDuration!: number;

  @Column({ default: 0, comment: '总错误数' })
  errorCount!: number;

  @Column({ default: 0, comment: 'JS错误数' })
  jsErrorCount!: number;

  @Column({ default: 0, comment: 'Promise错误数' })
  promiseErrorCount!: number;

  @Column({ default: 0, comment: '资源加载错误数' })
  resourceErrorCount!: number;

  @Column('json', {
    nullable: true,
    comment: '访问量Top页面（[{ url, count }]）',
  })
  topPages?: Array<{ url: string; count: number }>;

  @Column('json', {
    nullable: true,
    comment: '来源Top10（[{ referrer, count }]）',
  })
  topReferrers?: Array<{ referrer: string; count: number }>;
}
