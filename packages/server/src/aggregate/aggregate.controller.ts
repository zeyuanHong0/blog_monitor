import { Controller, Post, Query } from '@nestjs/common';
import { AggregateService } from './aggregate.service';

@Controller('aggregate')
export class AggregateController {
  constructor(private readonly aggregateService: AggregateService) {}

  /**
   * 手动触发每日聚合
   * POST /aggregate/daily?date=2026-05-20
   * date 不传则默认聚合昨天
   */
  @Post('daily')
  async triggerDaily(@Query('date') date?: string) {
    await this.aggregateService.aggregateDaily(date);
    return { ok: true, date: date ?? 'yesterday' };
  }
}
