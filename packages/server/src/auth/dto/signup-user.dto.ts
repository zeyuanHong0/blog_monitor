import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username!: string;

  @IsNotEmpty({ message: '密码不能为空' })
  password!: string;

  @IsOptional()
  canSignupCode?: string;
}
