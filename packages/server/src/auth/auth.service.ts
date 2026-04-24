import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';

import { UserService } from '@/user/user.service';
import { SigninUserDto } from './dto/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 验证用户
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) {
      return null;
    }
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    // 移除密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async signin(data: SigninUserDto, res: Response) {
    const { username, password } = data;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);
    }
    // 生成 JWT token
    const payload = { username: user.username, id: user.id };
    const token = this.jwtService.sign(payload);

    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true, // 防止 XSS 攻击
      secure: false, // 如果没有 HTTPS，设为 false
      sameSite: 'lax', // 允许同站导航携带 Cookie
      path: '/', // 确保在所有路径下都可用
      domain: '', // 明确设置为当前域名
      maxAge: 24 * 60 * 60 * 1000, // 1天
    });

    return {
      message: '登录成功',
      data: {
        token,
      },
    };
  }

  signout(res: Response) {
    // 清除 cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: '',
    });
    return {
      msg: '登出成功',
    };
  }
}
