import { Controller, Get, Body, Param, Delete, Post } from '@nestjs/common';
import { CollectService } from './collect.service';

@Controller('collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post('report')
  report(@Body() reportData: any) {
    return this.collectService.report(reportData);
  }
}
