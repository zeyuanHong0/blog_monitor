import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectService } from './collect.service';
import { CollectController } from './collect.controller';
import { PageView } from './entities/page-view.entity';
import { Performance } from './entities/performance.entity';
import { MonitorError } from './entities/error.entity';
import { MonitorEvent } from './entities/event.entity';

import { IpRegionModule } from '@/ip-region/ip-region.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageView,
      Performance,
      MonitorError,
      MonitorEvent,
    ]),
    IpRegionModule,
  ],
  controllers: [CollectController],
  providers: [CollectService],
})
export class CollectModule {}
