import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReportPayloadDto {
  @IsNotEmpty({ message: '上报应用ID不能为空' })
  @IsString({ message: '上报应用ID必须是字符串' })
  appId!: string;

  @IsArray({ message: '上报数据必须是数组' })
  @ArrayMinSize(1, { message: '上报数据不能为空' })
  data!: unknown[];
}
