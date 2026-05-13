import { Equals, IsObject, IsString } from 'class-validator';

import { BaseDataDto } from './baseData.dto';

export class EventDto extends BaseDataDto {
  @Equals('event', { message: '事件上报类型必须为 event' })
  type = 'event' as const;

  @IsString({ message: '事件名称必须是字符串' })
  eventName!: string;

  @IsObject({ message: '事件数据必须是对象' })
  eventData!: Record<string, unknown>;
}
