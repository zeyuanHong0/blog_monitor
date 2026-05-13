import { Type } from 'class-transformer';
import {
  Equals,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BaseDataDto } from './baseData.dto';
import { ErrorType } from '@/collect/types';

class FrameworkDto {
  @IsIn(['react', 'vue'], { message: '框架名称必须是 react 或 vue' })
  name!: 'react' | 'vue';

  @IsOptional()
  @IsString({ message: '组件名称必须是字符串' })
  componentName?: string;

  @IsOptional()
  @IsString({ message: '组件堆栈必须是字符串' })
  componentStack?: string;

  @IsOptional()
  @IsString({ message: 'Hook 名称必须是字符串' })
  hook?: string;
}

export class ErrorDto extends BaseDataDto {
  @Equals('error', { message: '错误上报类型必须为 error' })
  type = 'error' as const;

  @IsEnum(ErrorType, { message: '错误类型不合法' })
  errorType!: ErrorType;

  @IsString({ message: '错误信息必须是字符串' })
  message!: string;

  @IsOptional()
  @IsString({ message: '错误堆栈必须是字符串' })
  stack?: string;

  @IsOptional()
  @IsString({ message: '文件名必须是字符串' })
  filename?: string;

  @IsOptional()
  @IsInt({ message: '行号必须是整数' })
  lineno?: number;

  @IsOptional()
  @IsInt({ message: '列号必须是整数' })
  colno?: number;

  @IsOptional()
  @IsString({ message: '资源地址必须是字符串' })
  resourceUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FrameworkDto)
  framework?: FrameworkDto;
}
