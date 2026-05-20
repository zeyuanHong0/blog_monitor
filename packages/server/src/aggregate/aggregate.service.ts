import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DailyStat } from './entities/daily-stat.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';
import { ErrorType } from '@/enum/errorType.enum';

@Injectable()
export class AggregateService {
  constructor(
    private dailyStatRepository: Repository<DailyStat>,
    private pageViewRepository: Repository<PageView>,
    private performanceRepository: Repository<Performance>,
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
        `SUM(CASE WHEN err.errorType = '${ErrorType.JS}' THEN 1 ELSE 0 END)`,
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
      .where('DATE(err.createTime) = :date', { date: dateStr })
      .getRawOne<{
        errorCount: string;
        jsErrorCount: string;
        promiseErrorCount: string;
        resourceErrorCount: string;
      }>();

    return {
      errorCount: Number(res?.errorCount ?? 0),
      jsErrorCount: Number(res?.jsErrorCount ?? 0),
      promiseErrorCount: Number(res?.promiseErrorCount ?? 0),
      resourceErrorCount: Number(res?.resourceErrorCount ?? 0),
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
}
