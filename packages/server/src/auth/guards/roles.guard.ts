import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@/enum/role.enum';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //获取身份要求
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('requiredRoles', requiredRoles);

    // 如果没有身份要求，则允许访问
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user: { id: string; username: string; accountType: Role };
    }>();
    console.log('hasRequiredRole user', user);
    if (!user) {
      throw new UnauthorizedException('请登录');
    }
    const hasRequiredRole = requiredRoles.some(
      (role) => user.accountType === role,
    );
    if (!hasRequiredRole) {
      throw new HttpException('没有权限', 402);
    }
    return true;
  }
}
