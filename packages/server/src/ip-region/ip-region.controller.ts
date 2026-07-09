import { Controller, Get, Query } from '@nestjs/common';

import { IpRegionService } from './ip-region.service';

@Controller('dev/ip-region')
export class DevIpRegionController {
  constructor(private readonly ipRegionService: IpRegionService) {}

  @Get()
  search(@Query('ip') ip: string) {
    return this.ipRegionService.search(ip);
  }
}
