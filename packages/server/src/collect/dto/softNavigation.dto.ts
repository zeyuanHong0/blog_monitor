import { Equals, IsString } from 'class-validator';

import { BaseDataDto } from './baseData.dto';
import { IsNullableFiniteNumber } from '@/common/decorators/isNullableFiniteNumber.decorator';

export class SoftNavigationDto extends BaseDataDto {
  @Equals('soft_navigation', {
    message: '软导航上报类型必须为 soft_navigation',
  })
  type = 'soft_navigation' as const;

  @IsString({ message: '来源URL必须是字符串' })
  fromUrl!: string;

  @IsNullableFiniteNumber({ message: 'LCP 必须是数字或 null' })
  lcp!: number | null;

  @IsNullableFiniteNumber({ message: 'CLS 必须是数字或 null' })
  cls!: number | null;

  @IsNullableFiniteNumber({ message: 'INP 必须是数字或 null' })
  inp!: number | null;

  @IsNullableFiniteNumber({
    message: '软导航耗时必须是数字或 null',
  })
  navigationDuration!: number | null;
}
