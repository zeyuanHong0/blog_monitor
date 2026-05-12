import { Equals, IsString } from 'class-validator';

import { BaseDataDto } from './baseData.dto';

export class PageViewDto extends BaseDataDto {
  @Equals('pageview', { message: '页面访问上报类型必须为 pageview' })
  type = 'pageview' as const;

  @IsString({ message: '页面标题必须是字符串' })
  title!: string;

  @IsString({ message: '来源页面必须是字符串' })
  referrer!: string;
}
