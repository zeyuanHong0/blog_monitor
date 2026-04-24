import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { SigninUserDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async login(
    @Body() body: SigninUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 登录
    return this.authService.signin(body, res);
  }

  @Post('/signout')
  logout(@Res({ passthrough: true }) res: Response) {
    // 登出
    return this.authService.signout(res);
  }
}
