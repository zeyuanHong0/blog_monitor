import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageView } from './entities/page-view.entity';
import { Performance } from './entities/performance.entity';
import { MonitorError } from './entities/error.entity';
import { MonitorEvent } from './entities/event.entity';
import { IpRegionService } from '@/ip-region/ip-region.service';
import { PinoLogger } from 'nestjs-pino';

import { ReportPayloadDto } from './dto/reportPayload.dto';
import { PageViewDto } from './dto/pageview.dto';
import { PerformanceDto } from './dto/performance.dto';
import { SoftNavigationDto } from './dto/softNavigation.dto';
import { ErrorDto } from './dto/error.dto';
import { EventDto } from './dto/event.dto';
import { ReportData } from '@/collect/types';

@Injectable()
export class CollectService {
  constructor(
    @InjectRepository(PageView)
    private pageViewRepository: Repository<PageView>,
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
    @InjectRepository(MonitorError)
    private errorRepository: Repository<MonitorError>,
    @InjectRepository(MonitorEvent)
    private eventRepository: Repository<MonitorEvent>,
    private ipRegionService: IpRegionService,
    private readonly logger: PinoLogger,
  ) {}
  report(reportData: ReportPayloadDto) {
    console.log('Received report data:', reportData);
  }

  async savePageView(dto: PageViewDto, ip: string) {
    await this.pageViewRepository.save({ ...dto, ip });
  }

  async savePerformance(dto: PerformanceDto) {
    await this.performanceRepository.save(dto);
  }

  async saveSoftNavigation(dto: SoftNavigationDto) {
    const softDto = { ...dto, navigationType: 'soft' as const };
    await this.performanceRepository.save(softDto);
  }

  async saveError(dto: ErrorDto) {
    await this.errorRepository.save(dto);
  }

  async saveEvent(dto: EventDto) {
    await this.eventRepository.save(dto);
  }

  async processBatch(batchDto: ReportData[], ip: string) {
    const handlers = {
      pageview: (data: PageViewDto) => this.savePageView(data, ip),
      performance: (data: PerformanceDto) => this.savePerformance(data),
      soft_navigation: (data: SoftNavigationDto) =>
        this.saveSoftNavigation(data),
      error: (data: ErrorDto) => this.saveError(data),
      event: (data: EventDto) => this.saveEvent(data),
    };
    await Promise.all(
      batchDto.map((data) => {
        const handler = handlers[data.type];
        if (!handler) {
          return Promise.resolve();
        }
        return handler(data as never);
      }),
    );
    this.ipRegionService.search(ip).catch((error) => {
      this.logger.warn(`ip region search failed: ${ip}`, error);
    });
  }
}
