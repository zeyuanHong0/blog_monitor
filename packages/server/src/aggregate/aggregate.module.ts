import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregateService } from './aggregate.service';
import { AggregateController } from './aggregate.controller';
import { DailyStat } from './entities/daily-stat.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyStat, PageView, Performance, MonitorError]),
  ],
  controllers: [AggregateController],
  providers: [AggregateService],
})
export class AggregateModule {}
