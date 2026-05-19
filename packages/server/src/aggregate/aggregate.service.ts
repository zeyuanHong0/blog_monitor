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
}
