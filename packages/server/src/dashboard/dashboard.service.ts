import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStat } from '@/aggregate/entities/daily-stat.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';
import { Heartbeat } from '@/heartbeat/entities/heartbeat.entity';
import { QueryDto } from './dto/query.dto';
import dayjs from '@/common/dayjs.config';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DailyStat)
    private dailyStatRepository: Repository<DailyStat>,
    @InjectRepository(PageView)
    private pageViewRepository: Repository<PageView>,
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
    @InjectRepository(MonitorError)
    private errorRepository: Repository<MonitorError>,
    @InjectRepository(Heartbeat)
    private heartbeatRepository: Repository<Heartbeat>,
  ) {}

  private getDateRange(query: QueryDto): { start: string; end: string } {
    const end = query.endDate ?? dayjs().format('YYYY-MM-DD');
    const start =
      query.startDate ?? dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    return { start, end };
  }

  private async calculateUptime(hours: number): Promise<number> {
    const since = dayjs().subtract(hours, 'hour').toDate();

    const result = await this.heartbeatRepository
      .createQueryBuilder('hb')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN hb.isUp = 1 THEN 1 ELSE 0 END)', 'up')
      .where('hb.checkTime >= :since', { since })
      .getRawOne<{ total: string; up: string }>();

    const total = Number(result?.total ?? 0);
    const up = Number(result?.up ?? 0);

    if (total === 0) return 100;
    return Math.round((up / total) * 10000) / 100;
  }

  async getOverview() {
    const today = dayjs().format('YYYY-MM-DD');
    const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const [todayPvUv, todayErrors, trend, uptime, latestErrors] =
      await Promise.all([
        // 今日实时 PV/UV
        this.pageViewRepository
          .createQueryBuilder('pv')
          .select('COUNT(*)', 'pv')
          .addSelect('COUNT(DISTINCT pv.sessionId)', 'uv')
          .where('pv.createTime >= :start AND pv.createTime <= :end', {
            start: todayStart,
            end: todayEnd,
          })
          .getRawOne<{ pv: string; uv: string }>(),

        // 今日实时错误数
        this.errorRepository
          .createQueryBuilder('err')
          .where('err.createTime >= :start AND err.createTime <= :end', {
            start: todayStart,
            end: todayEnd,
          })
          .getCount(),

        // 近 7 天趋势
        this.dailyStatRepository
          .createQueryBuilder('ds')
          .select([
            'ds.date',
            'ds.pv',
            'ds.uv',
            'ds.errorCount',
            'ds.avgFcp',
            'ds.avgLcp',
          ])
          .where('ds.date >= :start AND ds.date <= :end', {
            start: sevenDaysAgo,
            end: today,
          })
          .orderBy('ds.date', 'ASC')
          .getMany(),

        // 近 24 小时可用率
        this.calculateUptime(24),

        // 最新 5 条错误
        this.errorRepository
          .createQueryBuilder('err')
          .select([
            'err.id',
            'err.errorType',
            'err.message',
            'err.url',
            'err.createTime',
          ])
          .orderBy('err.createTime', 'DESC')
          .limit(5)
          .getMany(),
      ]);

    return {
      today: {
        pv: Number(todayPvUv?.pv ?? 0),
        uv: Number(todayPvUv?.uv ?? 0),
        errorCount: todayErrors,
      },
      trend,
      uptime,
      latestErrors,
    };
  }
}
