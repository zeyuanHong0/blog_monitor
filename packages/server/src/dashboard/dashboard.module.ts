import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DailyStat } from '@/aggregate/entities/daily-stat.entity';
import { PageView } from '@/collect/entities/page-view.entity';
import { Performance } from '@/collect/entities/performance.entity';
import { MonitorError } from '@/collect/entities/error.entity';
import { Heartbeat } from '@/heartbeat/entities/heartbeat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyStat,
      PageView,
      Performance,
      MonitorError,
      Heartbeat,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
