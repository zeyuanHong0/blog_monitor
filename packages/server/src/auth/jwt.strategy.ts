import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { ConfigEnum } from '@/enum/config.enum';
import { JwtPayload } from './types/jwt-payload.type';
import { UserService } from '@/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 优先从 cookie 中提取
        (request: Request) => {
          const token = request?.cookies?.token as string | undefined;
          return token ?? null;
        },
        // 兼容从 Authorization header 中提取
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>(ConfigEnum.JWT_SECRET) || 'default_secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('无效的 token');
    }
    const user = await this.userService.findOneById(payload.id);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: payload.id,
      username: payload.username,
      accountType: user.accountType,
    };
  }
}
