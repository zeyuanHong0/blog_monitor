import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('traffic')
  getTraffic(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTraffic(query);
  }

  @Get('performance')
  getPerformance(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getPerformance(query);
  }

  @Get('errors')
  getErrors(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getErrors(query);
  }

  @Get('errors/:id')
  getErrorDetail(@Param('id') id: string) {
    return this.dashboardService.getErrorDetail(id);
  }

  @Get('uptime')
  getUptime() {
    return this.dashboardService.getUptime();
  }
}
