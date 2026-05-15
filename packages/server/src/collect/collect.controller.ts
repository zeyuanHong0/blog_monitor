import { Body, Controller, Ip, Post } from '@nestjs/common';

import { CollectService } from './collect.service';
import { ReportPayloadDto } from './dto/reportPayload.dto';
import { EventDto } from './dto/event.dto';
import { ErrorDto } from './dto/error.dto';
import { SoftNavigationDto } from './dto/softNavigation.dto';
import { PerformanceDto } from './dto/performance.dto';
import { PageViewDto } from './dto/pageview.dto';

@Controller('collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post('batch')
  report(@Body() reportData: ReportPayloadDto, @Ip() ip: string) {
    return this.collectService.processBatch(reportData.data, ip);
  }

  @Post('pageview')
  pageview(@Body() pageviewData: PageViewDto, @Ip() ip: string) {
    return this.collectService.savePageView(pageviewData, ip);
  }
  @Post('performance')
  performance(@Body() performanceData: PerformanceDto) {
    return this.collectService.savePerformance(performanceData);
  }
  @Post('soft_navigation')
  softNavigation(@Body() softNavigationData: SoftNavigationDto) {
    return this.collectService.saveSoftNavigation(softNavigationData);
  }
  @Post('error')
  error(@Body() errorData: ErrorDto) {
    return this.collectService.saveError(errorData);
  }
  @Post('event')
  event(@Body() eventData: EventDto) {
    return this.collectService.saveEvent(eventData);
  }
}
