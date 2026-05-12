import { Equals } from 'class-validator';

import { BaseDataDto } from './baseData.dto';
import { IsNullableFiniteNumber } from '@/common/decorators/isNullableFiniteNumber.decorator';

export class PerformanceDto extends BaseDataDto {
  @Equals('performance', { message: '性能上报类型必须为 performance' })
  type = 'performance' as const;

  @IsNullableFiniteNumber({ message: 'FCP 必须是数字或 null' })
  fcp!: number | null;

  @IsNullableFiniteNumber({ message: 'LCP 必须是数字或 null' })
  lcp!: number | null;

  @IsNullableFiniteNumber({ message: 'INP 必须是数字或 null' })
  inp!: number | null;

  @IsNullableFiniteNumber({ message: 'CLS 必须是数字或 null' })
  cls!: number | null;

  @IsNullableFiniteNumber({ message: 'TTFB 必须是数字或 null' })
  ttfb!: number | null;
}
