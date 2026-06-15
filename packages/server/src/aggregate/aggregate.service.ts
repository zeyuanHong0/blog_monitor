import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStat } from './entities/daily-stat.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';
import { ErrorType } from '@/enum/errorType.enum';
import dayjs from '@/common/dayjs.config';

@Injectable()
export class AggregateService {
  constructor(
    @InjectPinoLogger(AggregateService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(DailyStat)
    private dailyStatRepository: Repository<DailyStat>,
    @InjectRepository(PageView)
    private pageViewRepository: Repository<PageView>,
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
    @InjectRepository(MonitorError)
    private errorRepository: Repository<MonitorError>,
  ) {}

  private async aggregatePvUv(dateStr: string) {
    const res = await this.pageViewRepository
      .createQueryBuilder('pageView')
      .select('COUNT(DISTINCT pageView.sessionId)', 'uv')
      .addSelect('COUNT(*)', 'pv')
      .where('DATE(pageView.createTime) = :date', { date: dateStr })
      .getRawOne<{ uv: string; pv: string }>();

    return {
      uv: Number(res?.uv ?? 0),
      pv: Number(res?.pv ?? 0),
    };
  }

  private async aggregatePerformance(dateStr: string) {
    const res = await this.performanceRepository
      .createQueryBuilder('perf')
      .select('AVG(perf.fcp)', 'avgFcp')
      .addSelect('AVG(perf.lcp)', 'avgLcp')
      .addSelect('AVG(perf.inp)', 'avgInp')
      .addSelect('AVG(perf.cls)', 'avgCls')
      .where('DATE(perf.createTime) = :date', { date: dateStr })
      .andWhere('perf.navigationType = :type', { type: 'hard' })
      .getRawOne<{
        avgFcp: string | null;
        avgLcp: string | null;
        avgInp: string | null;
        avgCls: string | null;
      }>();

    return {
      avgFcp: Number(res?.avgFcp ?? 0),
      avgLcp: Number(res?.avgLcp ?? 0),
      avgInp: Number(res?.avgInp ?? 0),
      avgCls: Number(res?.avgCls ?? 0),
    };
  }

  private async aggregateSoftNav(dateStr: string) {
    const res = await this.performanceRepository
      .createQueryBuilder('perf')
      .select('COUNT(*)', 'softNavCount')
      .addSelect('AVG(perf.lcp)', 'avgSoftNavLcp')
      .addSelect('AVG(perf.navigationDuration)', 'avgSoftNavDuration')
      .where('DATE(perf.createTime) = :date', { date: dateStr })
      .andWhere('perf.navigationType = :type', { type: 'soft' })
      .getRawOne<{
        softNavCount: string;
        avgSoftNavLcp: string | null;
        avgSoftNavDuration: string | null;
      }>();

    return {
      softNavCount: Number(res?.softNavCount ?? 0),
      avgSoftNavLcp: Number(res?.avgSoftNavLcp ?? 0),
      avgSoftNavDuration: Number(res?.avgSoftNavDuration ?? 0),
    };
  }

  private async aggregateErrors(dateStr: string) {
    const res = await this.errorRepository
      .createQueryBuilder('err')
      .select('COUNT(*)', 'errorCount')
      .addSelect(
        `SUM(CASE WHEN err.errorType IN ('${ErrorType.JS}', '${ErrorType.FRAMEWORK}') THEN 1 ELSE 0 END)`,
        'jsErrorCount',
      )
      .addSelect(
        `SUM(CASE WHEN err.errorType = '${ErrorType.PROMISE}' THEN 1 ELSE 0 END)`,
        'promiseErrorCount',
      )
      .addSelect(
        `SUM(CASE WHEN err.errorType = '${ErrorType.RESOURCE}' THEN 1 ELSE 0 END)`,
        'resourceErrorCount',
      )
      .addSelect(
        `SUM(CASE WHEN err.errorType = '${ErrorType.AJAX}' THEN 1 ELSE 0 END)`,
        'ajaxErrorCount',
      )
      .addSelect(
        `SUM(CASE WHEN err.errorType = '${ErrorType.NETWORK}' THEN 1 ELSE 0 END)`,
        'networkErrorCount',
      )
      .addSelect(
        `SUM(CASE WHEN err.errorType IN ('${ErrorType.CUSTOM}', '${ErrorType.UNKNOWN}') THEN 1 ELSE 0 END)`,
        'otherErrorCount',
      )
      .where('DATE(err.createTime) = :date', { date: dateStr })
      .getRawOne<{
        errorCount: string;
        jsErrorCount: string;
        promiseErrorCount: string;
        resourceErrorCount: string;
        ajaxErrorCount: string;
        networkErrorCount: string;
        otherErrorCount: string;
      }>();

    return {
      errorCount: Number(res?.errorCount ?? 0),
      jsErrorCount: Number(res?.jsErrorCount ?? 0),
      promiseErrorCount: Number(res?.promiseErrorCount ?? 0),
      resourceErrorCount: Number(res?.resourceErrorCount ?? 0),
      ajaxErrorCount: Number(res?.ajaxErrorCount ?? 0),
      networkErrorCount: Number(res?.networkErrorCount ?? 0),
      otherErrorCount: Number(res?.otherErrorCount ?? 0),
    };
  }

  private async aggregateTopPages(
    dateStr: string,
  ): Promise<Array<{ url: string; count: number }>> {
    const rows = await this.pageViewRepository
      .createQueryBuilder('pageView')
      .select('pageView.url', 'url')
      .addSelect('COUNT(*)', 'count')
      .where('DATE(pageView.createTime) = :date', { date: dateStr })
      .groupBy('pageView.url')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany<{ url: string; count: string }>();

    return rows.map((r) => ({ url: r.url, count: Number(r.count) }));
  }

  private async aggregateTopReferrers(
    dateStr: string,
  ): Promise<Array<{ referrer: string; count: number }>> {
    const rows = await this.pageViewRepository
      .createQueryBuilder('pageView')
      .select('pageView.referrer', 'referrer')
      .addSelect('COUNT(*)', 'count')
      .where('DATE(pageView.createTime) = :date', { date: dateStr })
      .andWhere('pageView.referrer IS NOT NULL')
      .andWhere("pageView.referrer != ''")
      .groupBy('pageView.referrer')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany<{ referrer: string; count: string }>();

    return rows.map((r) => ({ referrer: r.referrer, count: Number(r.count) }));
  }

  /**
   * 每天凌晨 1:00 执行，聚合昨日数据写入 daily_stats
   * 也可手动传入 dateStr（YYYY-MM-DD）触发指定日期的回填
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async aggregateDaily(dateStr?: string): Promise<void> {
    const date = dateStr ?? dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    this.logger.info(`开始聚合 ${date} 的统计数据`);

    // 顺序执行
    const pvUv = await this.aggregatePvUv(date);
    const performance = await this.aggregatePerformance(date);
    const softNav = await this.aggregateSoftNav(date);
    const errors = await this.aggregateErrors(date);
    const topPages = await this.aggregateTopPages(date);
    const topReferrers = await this.aggregateTopReferrers(date);

    await this.dailyStatRepository.upsert(
      {
        date,
        ...pvUv,
        ...performance,
        ...softNav,
        ...errors,
        topPages,
        topReferrers,
      },
      ['date'],
    );

    this.logger.info(
      `${date} 聚合完成：PV=${pvUv.pv} UV=${pvUv.uv} 错误数=${errors.errorCount}`,
    );
  }
}
