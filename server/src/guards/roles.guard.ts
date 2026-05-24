import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { ROLES } from 'src/utils';

@Injectable()
export class RolesGuard implements CanActivate {
    // eslint-disable-next-line prettier/prettier
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<ROLES[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        const isValidRole = requiredRoles.includes(user?.roleId);
        if (!isValidRole) {
            throw new UnauthorizedException({
                status: false,
                message: 'Unauthorized',
                data: null,
            });
        }
        return true;
    }
}
