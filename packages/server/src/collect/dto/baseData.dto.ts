import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class BaseDataDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  type!: string;

  @IsNotEmpty({ message: '应用ID不能为空' })
  @IsString({ message: '应用ID必须是字符串' })
  appId!: string;

  @IsNotEmpty({ message: '会话ID不能为空' })
  @IsString({ message: '会话ID必须是字符串' })
  sessionId!: string;

  @IsNotEmpty({ message: 'URL不能为空' })
  @IsUrl({ require_tld: false }, { message: 'URL必须是合法的地址' })
  url!: string;

  @IsNotEmpty({ message: '用户代理不能为空' })
  @IsString({ message: '用户代理必须是字符串' })
  userAgent!: string;

  @IsNotEmpty({ message: '时间戳不能为空' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: '时间戳必须是有效数字' },
  )
  timestamp!: number;
}
