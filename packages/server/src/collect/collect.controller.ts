import { Body, Controller, Post } from '@nestjs/common';

import { CollectService } from './collect.service';
import { ReportPayloadDto } from './dto/reportPayload.dto';

@Controller('collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post('report')
  report(@Body() reportData: ReportPayloadDto) {
    return this.collectService.report(reportData);
  }
}
