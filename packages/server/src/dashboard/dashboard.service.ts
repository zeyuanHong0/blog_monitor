import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStat } from '@/aggregate/entities/daily-stat.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';
import { Heartbeat } from '@/heartbeat/entities/heartbeat.entity';
import { DashboardQueryDto } from './dto/query.dto';
import dayjs from '@/common/dayjs.config';

interface UserAgentDistribution {
  browserDistribution: { name: string; value: number }[];
  deviceDistribution: { name: string; value: number }[];
}

type ErrorTrendItem = Pick<
  DailyStat,
  | 'date'
  | 'jsErrorCount'
  | 'promiseErrorCount'
  | 'resourceErrorCount'
  | 'ajaxErrorCount'
  | 'networkErrorCount'
  | 'otherErrorCount'
>;

type HourlyErrorTrendRow = {
  hour: string;
  count: string;
  errorType: string;
};

type ErrorListRow = {
  id: string;
  message: string;
  errorType: string;
  lastSeen: string;
};

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

  private getDateRange(query: DashboardQueryDto): {
    start: string;
    end: string;
  } {
    const end = query.endDate
      ? dayjs(query.endDate).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
    const start = query.startDate
      ? dayjs(query.startDate).format('YYYY-MM-DD')
      : dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    return { start, end };
  }

  private handleUserAgent(userAgentList: string[]): UserAgentDistribution {
    // UA 格式："Chrome 148.0.0.0 | macOS 10.15.7 | Desktop"
    const browserCount: Record<string, number> = {};
    const deviceCount: Record<string, number> = {};

    for (const ua of userAgentList) {
      if (!ua) continue;
      const parts = ua.split('|').map((p) => p.trim());
      const browser = parts[0]?.split(' ')[0] ?? '其他';
      const device = parts[2] ?? 'Desktop';
      browserCount[browser] = (browserCount[browser] ?? 0) + 1;
      deviceCount[device] = (deviceCount[device] ?? 0) + 1;
    }

    return {
      browserDistribution: Object.entries(browserCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      deviceDistribution: Object.entries(deviceCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    };
  }

  // 处理趋势数据格式，转化成前端图表需要的格式
  private handleTrendData(trendData: DailyStat[]) {
    const dateList = trendData.map((item) => item.date);
    const pvData = { name: 'PV', data: trendData.map((item) => item.pv) };
    const uvData = { name: 'UV', data: trendData.map((item) => item.uv) };
    const errorCountData = {
      name: '错误数',
      data: trendData.map((item) => item.errorCount),
    };
    return {
      dateList,
      pvData,
      uvData,
      errorCountData,
    };
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

    const [
      todayPvUv,
      todayErrors,
      trend,
      uptime,
      uaDistribution,
      todayTopPages,
      latestErrors,
    ] = await Promise.all([
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
        .select(['ds.date', 'ds.pv', 'ds.uv', 'ds.errorCount'])
        .where('ds.date >= :start AND ds.date <= :end', {
          start: sevenDaysAgo,
          end: today,
        })
        .orderBy('ds.date', 'ASC')
        .getMany()
        .then((data) => this.handleTrendData(data)),

      // 近 24 小时可用率
      this.calculateUptime(24),

      // 今日浏览器和设备分布（从 page_views 中获取 UserAgent 字段，解析后统计）
      this.pageViewRepository
        .createQueryBuilder('pv')
        .select('pv.userAgent', 'userAgent')
        .where('pv.createTime >= :start AND pv.createTime <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .getRawMany<{ userAgent: string }>()
        .then((results) =>
          this.handleUserAgent(results.map((r) => r.userAgent)),
        ),

      // 今日热门页面 TOP5
      this.pageViewRepository
        .createQueryBuilder('pv')
        .select('pv.url', 'url')
        .addSelect('COUNT(*)', 'count')
        .where('pv.createTime >= :start AND pv.createTime <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .groupBy('pv.url')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany<{ url: string; count: string }>(),

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
      data: {
        today: {
          pv: Number(todayPvUv?.pv ?? 0),
          uv: Number(todayPvUv?.uv ?? 0),
          errorCount: todayErrors,
          topPages: todayTopPages.map((r) => ({
            url: r.url,
            count: Number(r.count),
          })),
          browserDistribution: uaDistribution.browserDistribution,
          deviceDistribution: uaDistribution.deviceDistribution,
        },
        trend,
        uptime,
        latestErrors,
      },
    };
  }

  async getTraffic(query: DashboardQueryDto) {
    const { start, end } = this.getDateRange(query);
    const isHourly = query.granularity === 'hour' || start === end;

    const [trendRaw, hourlyTrendRaw, topPages, hourlyRaw] = await Promise.all([
      // PV/UV 日粒度趋势（仅多天时使用）
      isHourly
        ? Promise.resolve([] as Pick<DailyStat, 'date' | 'pv' | 'uv'>[])
        : this.dailyStatRepository
            .createQueryBuilder('ds')
            .select(['ds.date', 'ds.pv', 'ds.uv'])
            .where('ds.date >= :start AND ds.date <= :end', { start, end })
            .orderBy('ds.date', 'ASC')
            .getMany(),

      // PV/UV 小时粒度趋势（仅单天时使用）
      isHourly
        ? this.pageViewRepository
            .createQueryBuilder('pv')
            .select('HOUR(pv.createTime)', 'hour')
            .addSelect('COUNT(*)', 'pv')
            .addSelect('COUNT(DISTINCT pv.sessionId)', 'uv')
            .where(
              'DATE(pv.createTime) >= :start AND DATE(pv.createTime) <= :end',
              { start, end },
            )
            .groupBy('HOUR(pv.createTime)')
            .orderBy('hour', 'ASC')
            .getRawMany<{ hour: string; pv: string; uv: string }>()
        : Promise.resolve([] as { hour: string; pv: string; uv: string }[]),

      // 页面 Top5（来自 page_views 分组）
      this.pageViewRepository
        .createQueryBuilder('pv')
        .select('pv.url', 'url')
        .addSelect('COUNT(*)', 'count')
        .where(
          'DATE(pv.createTime) >= :start AND DATE(pv.createTime) <= :end',
          { start, end },
        )
        .groupBy('pv.url')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany<{ url: string; count: string }>(),

      // 访问时段分布（按小时分组，统计整个日期范围内各时段的 PV）
      this.pageViewRepository
        .createQueryBuilder('pv')
        .select('HOUR(pv.createTime)', 'hour')
        .addSelect('COUNT(*)', 'count')
        .where(
          'DATE(pv.createTime) >= :start AND DATE(pv.createTime) <= :end',
          { start, end },
        )
        .groupBy('HOUR(pv.createTime)')
        .orderBy('hour', 'ASC')
        .getRawMany<{ hour: string; count: string }>(),
    ]);

    // 转换趋势数据格式，匹配前端 LineChart 所需结构
    let trend: {
      dateList: string[];
      pvData: { name: string; data: number[] };
      uvData: { name: string; data: number[] };
    };
    if (isHourly) {
      const hourlyMap = new Map(
        hourlyTrendRaw.map((r) => [
          Number(r.hour),
          { pv: Number(r.pv), uv: Number(r.uv) },
        ]),
      );
      trend = {
        dateList: Array.from({ length: 24 }, (_, i) => `${i}时`),
        pvData: {
          name: 'PV',
          data: Array.from({ length: 24 }, (_, i) => hourlyMap.get(i)?.pv ?? 0),
        },
        uvData: {
          name: 'UV',
          data: Array.from({ length: 24 }, (_, i) => hourlyMap.get(i)?.uv ?? 0),
        },
      };
    } else {
      trend = {
        dateList: trendRaw.map((item) => item.date),
        pvData: { name: 'PV', data: trendRaw.map((item) => item.pv) },
        uvData: { name: 'UV', data: trendRaw.map((item) => item.uv) },
      };
    }

    // 转换为 0-23 时完整数组，缺失时段补 0
    const hourlyMap = new Map(
      hourlyRaw.map((r) => [Number(r.hour), Number(r.count)]),
    );
    const hourlyDistribution = Array.from(
      { length: 24 },
      (_, i) => hourlyMap.get(i) ?? 0,
    );

    return {
      data: {
        trend,
        topPages: topPages.map((r) => ({ url: r.url, count: Number(r.count) })),
        hourlyDistribution,
      },
    };
  }

  async getErrors(query: DashboardQueryDto) {
    const { start, end } = this.getDateRange(query);
    const isHourly = query.granularity === 'hour' || start === end;

    const [trendRaw, hourlyTrendRaw, list]: [
      ErrorTrendItem[],
      HourlyErrorTrendRow[],
      ErrorListRow[],
    ] = await Promise.all([
      isHourly
        ? Promise.resolve([] as ErrorTrendItem[])
        : (this.dailyStatRepository
            .createQueryBuilder('ds')
            .select([
              'ds.jsErrorCount',
              'ds.promiseErrorCount',
              'ds.resourceErrorCount',
              'ds.ajaxErrorCount',
              'ds.networkErrorCount',
              'ds.otherErrorCount',
              'ds.date',
            ])
            .where('ds.date >= :start AND ds.date <= :end', { start, end })
            .orderBy('ds.date', 'ASC')
            .getMany() as Promise<ErrorTrendItem[]>),

      isHourly
        ? this.errorRepository
            .createQueryBuilder('err')
            .select('HOUR(err.createTime)', 'hour')
            .addSelect('COUNT(*)', 'count')
            .addSelect('err.errorType', 'errorType')
            .where(
              'DATE(err.createTime) >= :start AND DATE(err.createTime) <= :end',
              { start, end },
            )
            .groupBy('hour')
            .addGroupBy('err.errorType')
            .orderBy('hour', 'ASC')
            .getRawMany<HourlyErrorTrendRow>()
        : Promise.resolve([] as HourlyErrorTrendRow[]),

      // 错误列表
      this.errorRepository
        .createQueryBuilder('err')
        .select('err.id', 'id')
        .addSelect('err.message', 'message')
        .addSelect('err.errorType', 'errorType')
        .addSelect('err.createTime', 'lastSeen')
        .where(
          'DATE(err.createTime) >= :start AND DATE(err.createTime) <= :end',
          { start, end },
        )
        .orderBy('err.createTime', 'DESC')
        .getRawMany<ErrorListRow>(),
    ]);

    let trend: {
      dateList: string[];
      jsErrorCountData: { name: string; data: number[] };
      promiseErrorCountData: { name: string; data: number[] };
      resourceErrorCountData: { name: string; data: number[] };
      ajaxErrorCountData: { name: string; data: number[] };
      networkErrorCountData: { name: string; data: number[] };
      otherErrorCountData: { name: string; data: number[] };
    };
    if (isHourly) {
      const hourlyMap = new Map<
        number,
        {
          jsErrorCount: number;
          promiseErrorCount: number;
          resourceErrorCount: number;
          ajaxErrorCount: number;
          networkErrorCount: number;
          otherErrorCount: number;
        }
      >();

      const defaultHourly = {
        jsErrorCount: 0,
        promiseErrorCount: 0,
        resourceErrorCount: 0,
        ajaxErrorCount: 0,
        networkErrorCount: 0,
        otherErrorCount: 0,
      };

      for (const r of hourlyTrendRaw) {
        const hour = Number(r.hour);
        const current = hourlyMap.get(hour) ?? { ...defaultHourly };
        const count = Number(r.count);

        if (r.errorType === 'js' || r.errorType === 'framework') {
          current.jsErrorCount += count;
        } else if (r.errorType === 'promise') {
          current.promiseErrorCount = count;
        } else if (r.errorType === 'resource') {
          current.resourceErrorCount = count;
        } else if (r.errorType === 'ajax') {
          current.ajaxErrorCount = count;
        } else if (r.errorType === 'network') {
          current.networkErrorCount = count;
        } else {
          current.otherErrorCount += count;
        }
        hourlyMap.set(hour, current);
      }

      trend = {
        dateList: Array.from({ length: 24 }, (_, i) => `${i}时`),
        jsErrorCountData: {
          name: 'JS错误数',
          data: Array.from(
            { length: 24 },
            (_, i) => hourlyMap.get(i)?.jsErrorCount ?? 0,
          ),
        },
        promiseErrorCountData: {
          name: 'Promise错误数',
          data: Array.from(
            { length: 24 },
            (_, i) => hourlyMap.get(i)?.promiseErrorCount ?? 0,
          ),
        },
        resourceErrorCountData: {
          name: '资源错误数',
          data: Array.from(
            { length: 24 },
            (_, i) => hourlyMap.get(i)?.resourceErrorCount ?? 0,
          ),
        },
        ajaxErrorCountData: {
          name: '接口错误数',
          data: Array.from(
            { length: 24 },
            (_, i) => hourlyMap.get(i)?.ajaxErrorCount ?? 0,
          ),
        },
        networkErrorCountData: {
          name: '网络错误数',
          data: Array.from(
            { length: 24 },
            (_, i) => hourlyMap.get(i)?.networkErrorCount ?? 0,
          ),
        },
        otherErrorCountData: {
          name: '其他错误数',
          data: Array.from(
            { length: 24 },
            (_, i) => hourlyMap.get(i)?.otherErrorCount ?? 0,
          ),
        },
      };
    } else {
      trend = {
        dateList: trendRaw.map((item) => item.date),
        jsErrorCountData: {
          name: 'JS错误数',
          data: trendRaw.map((item) => item.jsErrorCount),
        },
        promiseErrorCountData: {
          name: 'Promise错误数',
          data: trendRaw.map((item) => item.promiseErrorCount),
        },
        resourceErrorCountData: {
          name: '资源错误数',
          data: trendRaw.map((item) => item.resourceErrorCount),
        },
        ajaxErrorCountData: {
          name: '接口错误数',
          data: trendRaw.map((item) => item.ajaxErrorCount),
        },
        networkErrorCountData: {
          name: '网络错误数',
          data: trendRaw.map((item) => item.networkErrorCount),
        },
        otherErrorCountData: {
          name: '其他错误数',
          data: trendRaw.map((item) => item.otherErrorCount),
        },
      };
    }

    return {
      data: {
        trend,
        list: list.map((r) => ({
          id: r.id,
          message: r.message,
          errorType: r.errorType,
          lastSeen: r.lastSeen,
        })),
      },
    };
  }

  async getErrorDetail(id: string) {
    const error = await this.errorRepository.findOneBy({ id });
    return { data: error };
  }

  async getUptime() {
    const twentyFourHoursAgo = dayjs().subtract(24, 'hour').toDate();
    const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate();

    const [
      uptime24h,
      responseTrend,
      dailyStatusRaw,
      sslExpiry,
      failureRecords,
    ] = await Promise.all([
      // 可用率（近 24 小时）
      this.calculateUptime(24),

      // 响应时间趋势（近 24 小时，按小时分组）
      this.heartbeatRepository
        .createQueryBuilder('hb')
        .select("DATE_FORMAT(hb.checkTime, '%Y-%m-%d %H:00:00')", 'hour')
        .addSelect('AVG(hb.responseTime)', 'avgResponseTime')
        .addSelect('COUNT(*)', 'checkCount')
        .where('hb.checkTime >= :twentyFourHoursAgo', { twentyFourHoursAgo })
        .groupBy('hour')
        .orderBy('hour', 'ASC')
        .getRawMany<{
          hour: string;
          avgResponseTime: string;
          checkCount: string;
        }>(),

      // 30 天每日可用状态（按天聚合）
      this.heartbeatRepository
        .createQueryBuilder('hb')
        .select("DATE_FORMAT(hb.checkTime, '%Y-%m-%d')", 'date')
        .addSelect('COUNT(*)', 'total')
        .addSelect('SUM(CASE WHEN hb.isUp = 1 THEN 1 ELSE 0 END)', 'upCount')
        .where('hb.checkTime >= :thirtyDaysAgo', { thirtyDaysAgo })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany<{
          date: string;
          total: string;
          upCount: string;
        }>(),

      // 最新 SSL 到期时间
      this.heartbeatRepository
        .createQueryBuilder('hb')
        .select('hb.sslExpiry', 'sslExpiry')
        .where('hb.sslExpiry IS NOT NULL')
        .orderBy('hb.checkTime', 'DESC')
        .limit(1)
        .getRawOne<{ sslExpiry: string | null }>(),

      // 故障记录（isUp=false 的最近 20 条）
      this.heartbeatRepository
        .createQueryBuilder('hb')
        .select([
          'hb.id',
          'hb.targetUrl',
          'hb.statusCode',
          'hb.responseTime',
          'hb.errorMessage',
          'hb.checkTime',
        ])
        .where('hb.isUp = :isUp', { isUp: false })
        .orderBy('hb.checkTime', 'DESC')
        .limit(20)
        .getMany(),
    ]);

    // 构建 30 天每日状态（补齐无数据的日期）
    const dailyStatusMap = new Map<
      string,
      { total: number; upCount: number }
    >();
    for (const row of dailyStatusRaw) {
      dailyStatusMap.set(row.date, {
        total: Number(row.total),
        upCount: Number(row.upCount),
      });
    }

    const dailyStatus: {
      date: string;
      status: 'up' | 'down' | 'noData';
      description: string;
    }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const dayData = dailyStatusMap.get(date);

      if (!dayData || dayData.total === 0) {
        dailyStatus.push({ date, status: 'noData', description: '无数据' });
      } else if (dayData.upCount === dayData.total) {
        dailyStatus.push({ date, status: 'up', description: '全天正常' });
      } else {
        const downCount = dayData.total - dayData.upCount;
        dailyStatus.push({
          date,
          status: 'down',
          description: `${downCount} 次故障`,
        });
      }
    }

    // 构建 24 小时响应趋势（补齐无数据的小时）
    const responseTrendMap = new Map<
      string,
      { hour: string; avgResponseTime: number | null; checkCount: number }
    >();
    for (const row of responseTrend) {
      responseTrendMap.set(row.hour, {
        hour: row.hour,
        avgResponseTime:
          row.avgResponseTime !== null
            ? Math.round(Number(row.avgResponseTime))
            : null,
        checkCount: Number(row.checkCount),
      });
    }

    const responseTrendChart: {
      hour: string;
      avgResponseTime: number | null;
      checkCount: number;
    }[] = [];
    for (let i = 23; i >= 0; i--) {
      const hourKey = dayjs()
        .subtract(i, 'hour')
        .startOf('hour')
        .format('YYYY-MM-DD HH:00:00');
      responseTrendChart.push(
        responseTrendMap.get(hourKey) ?? {
          hour: hourKey,
          avgResponseTime: null,
          checkCount: 0,
        },
      );
    }

    return {
      data: {
        uptime24h,
        responseTrend: responseTrendChart,
        dailyStatus,
        sslExpiry: sslExpiry?.sslExpiry ?? null,
        failureRecords,
      },
    };
  }

  async getPerformance(query: DashboardQueryDto) {
    const { start, end } = this.getDateRange(query);
    const navigationType = query.navigationType || 'soft';
    const isSingleDay = start === end;

    const [cards, trend, slowPages] = await Promise.all([
      this.getPerformanceCards(start, end, navigationType),
      this.getPerformanceTrend(start, end, navigationType, isSingleDay),
      this.getSlowPages(start, end, navigationType),
    ]);

    return { data: { cards, trend, slowPages } };
  }

  private async getPerformanceCards(
    start: string,
    end: string,
    navigationType: string,
  ) {
    const qb = this.performanceRepository
      .createQueryBuilder('perf')
      .where(
        'DATE(perf.createTime) >= :start AND DATE(perf.createTime) <= :end',
        { start, end },
      );

    if (navigationType !== 'all') {
      qb.andWhere('perf.navigationType = :type', { type: navigationType });
    }

    if (navigationType === 'soft') {
      qb.select('AVG(perf.lcp)', 'avgLcp')
        .addSelect('AVG(perf.cls)', 'avgCls')
        .addSelect('AVG(perf.inp)', 'avgInp')
        .addSelect('AVG(perf.navigationDuration)', 'avgNavDuration')
        .addSelect('COUNT(*)', 'sampleCount');
    } else if (navigationType === 'hard') {
      qb.select('AVG(perf.ttfb)', 'avgTtfb')
        .addSelect('AVG(perf.fcp)', 'avgFcp')
        .addSelect('AVG(perf.lcp)', 'avgLcp')
        .addSelect('AVG(perf.cls)', 'avgCls')
        .addSelect('COUNT(*)', 'sampleCount');
    } else {
      qb.select('AVG(perf.lcp)', 'avgLcp')
        .addSelect('AVG(perf.cls)', 'avgCls')
        .addSelect('AVG(perf.inp)', 'avgInp')
        .addSelect('COUNT(*)', 'sampleCount');
    }

    const raw = await qb.getRawOne<
      Record<string, string | null> & { sampleCount: string }
    >();

    const twoDecimal = (v: string | null | undefined) =>
      v !== null && v !== undefined ? Math.round(Number(v) * 100) / 100 : null;

    if (navigationType === 'soft') {
      return {
        avgLcp: twoDecimal(raw?.avgLcp),
        avgCls: twoDecimal(raw?.avgCls),
        avgInp: twoDecimal(raw?.avgInp),
        avgNavDuration: twoDecimal(raw?.avgNavDuration),
        sampleCount: Number(raw?.sampleCount ?? 0),
      };
    }
    if (navigationType === 'hard') {
      return {
        avgTtfb: twoDecimal(raw?.avgTtfb),
        avgFcp: twoDecimal(raw?.avgFcp),
        avgLcp: twoDecimal(raw?.avgLcp),
        avgCls: twoDecimal(raw?.avgCls),
        sampleCount: Number(raw?.sampleCount ?? 0),
      };
    }
    return {
      avgLcp: twoDecimal(raw?.avgLcp),
      avgCls: twoDecimal(raw?.avgCls),
      avgInp: twoDecimal(raw?.avgInp),
      sampleCount: Number(raw?.sampleCount ?? 0),
    };
  }

  private async getPerformanceTrend(
    start: string,
    end: string,
    navigationType: string,
    isSingleDay: boolean,
  ) {
    if (isSingleDay) {
      return this.getPerformanceTrendHourly(start, end, navigationType);
    }
    return this.getPerformanceTrendDaily(start, end, navigationType);
  }

  private async getPerformanceTrendHourly(
    start: string,
    end: string,
    navigationType: string,
  ) {
    const metricFields = this.getTrendMetrics(navigationType);
    const qb = this.performanceRepository
      .createQueryBuilder('perf')
      .select('HOUR(perf.createTime)', 'hour');

    for (const { expr, alias } of metricFields) {
      qb.addSelect(`AVG(${expr})`, alias);
    }

    qb.where(
      'DATE(perf.createTime) >= :start AND DATE(perf.createTime) <= :end',
      { start, end },
    );

    if (navigationType !== 'all') {
      qb.andWhere('perf.navigationType = :type', { type: navigationType });
    }

    qb.groupBy('HOUR(perf.createTime)').orderBy('hour', 'ASC');

    const rows = await qb.getRawMany<Record<string, string>>();

    const round2 = (v: string) => Math.round(Number(v) * 100) / 100;

    const series = metricFields.map(({ alias }) => {
      const map = new Map(rows.map((r) => [Number(r.hour), round2(r[alias])]));
      return {
        name: alias,
        data: Array.from({ length: 24 }, (_, i) => map.get(i) ?? 0),
      };
    });

    return {
      xData: Array.from({ length: 24 }, (_, i) => `${i}时`),
      series,
    };
  }

  private async getPerformanceTrendDaily(
    start: string,
    end: string,
    navigationType: string,
  ) {
    const metricFields = this.getTrendMetrics(navigationType);
    const qb = this.performanceRepository
      .createQueryBuilder('perf')
      .select('DATE(perf.createTime)', 'date');

    for (const { expr, alias } of metricFields) {
      qb.addSelect(`AVG(${expr})`, alias);
    }

    qb.where(
      'DATE(perf.createTime) >= :start AND DATE(perf.createTime) <= :end',
      { start, end },
    );

    if (navigationType !== 'all') {
      qb.andWhere('perf.navigationType = :type', { type: navigationType });
    }

    qb.groupBy('DATE(perf.createTime)').orderBy('date', 'ASC');

    const rows = await qb.getRawMany<Record<string, string>>();

    const round2 = (v: string) => Math.round(Number(v) * 100) / 100;

    const series = metricFields.map(({ alias }) => ({
      name: alias,
      data: rows.map((r) => round2(r[alias])),
    }));

    return {
      xData: rows.map((r) => dayjs(r.date).format('YYYY-MM-DD')),
      series,
    };
  }

  private getTrendMetrics(
    navigationType: string,
  ): { expr: string; alias: string }[] {
    switch (navigationType) {
      case 'soft':
        return [
          { expr: 'perf.lcp', alias: 'avgLcp' },
          { expr: 'perf.cls', alias: 'avgCls' },
          { expr: 'perf.inp', alias: 'avgInp' },
          { expr: 'perf.navigationDuration', alias: 'avgNavDuration' },
        ];
      case 'hard':
        return [
          { expr: 'perf.ttfb', alias: 'avgTtfb' },
          { expr: 'perf.fcp', alias: 'avgFcp' },
          { expr: 'perf.lcp', alias: 'avgLcp' },
          { expr: 'perf.cls', alias: 'avgCls' },
        ];
      default:
        return [
          { expr: 'perf.lcp', alias: 'avgLcp' },
          { expr: 'perf.cls', alias: 'avgCls' },
          { expr: 'perf.inp', alias: 'avgInp' },
        ];
    }
  }

  private async getSlowPages(
    start: string,
    end: string,
    navigationType: string,
  ) {
    const qb = this.performanceRepository
      .createQueryBuilder('perf')
      .where(
        'DATE(perf.createTime) >= :start AND DATE(perf.createTime) <= :end AND perf.lcp IS NOT NULL',
        { start, end },
      );

    if (navigationType !== 'all') {
      qb.andWhere('perf.navigationType = :type', { type: navigationType });
    }

    if (navigationType === 'soft') {
      qb.select('perf.fromUrl', 'fromUrl')
        .addSelect('perf.url', 'url')
        .addSelect('AVG(perf.lcp)', 'avgLcp')
        .addSelect('AVG(perf.navigationDuration)', 'avgNavDuration')
        .addSelect('COUNT(*)', 'sampleCount')
        .groupBy('perf.fromUrl')
        .addGroupBy('perf.url');
    } else if (navigationType === 'hard') {
      qb.select('perf.url', 'url')
        .addSelect('AVG(perf.lcp)', 'avgLcp')
        .addSelect('AVG(perf.fcp)', 'avgFcp')
        .addSelect('AVG(perf.ttfb)', 'avgTtfb')
        .addSelect('COUNT(*)', 'sampleCount')
        .groupBy('perf.url');
    } else {
      qb.select('perf.url', 'url')
        .addSelect('AVG(perf.lcp)', 'avgLcp')
        .addSelect('AVG(perf.inp)', 'avgInp')
        .addSelect('AVG(perf.fcp)', 'avgFcp')
        .addSelect('COUNT(*)', 'sampleCount')
        .groupBy('perf.url');
    }

    qb.orderBy('avgLcp', 'DESC').limit(10);

    const raw = await qb.getRawMany<Record<string, string>>();

    const twoDecimal = (v: string | null | undefined) =>
      v !== null && v !== undefined ? Math.round(Number(v) * 100) / 100 : null;

    return raw.map((r) => {
      const base = {
        url: r.url,
        avgLcp: twoDecimal(r.avgLcp),
        sampleCount: Number(r.sampleCount),
      };
      if (navigationType === 'soft') {
        return {
          ...base,
          fromUrl: r.fromUrl || '/',
          avgNavDuration: twoDecimal(r.avgNavDuration),
        };
      }
      if (navigationType === 'hard') {
        return {
          ...base,
          avgFcp: twoDecimal(r.avgFcp),
          avgTtfb: twoDecimal(r.avgTtfb),
        };
      }
      return {
        ...base,
        avgFcp: twoDecimal(r.avgFcp),
        avgInp: twoDecimal(r.avgInp),
      };
    });
  }
}
