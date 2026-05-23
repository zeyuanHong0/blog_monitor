import { IsString, IsOptional, IsIn } from 'class-validator';

export class DashboardQueryDto {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsIn(['hour', 'day'])
  @IsOptional()
  granularity?: 'hour' | 'day';
}
