import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  UserRole,
  UserRoleEntries,
} from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { UserPayload } from "./jwt-strategy";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    return UserRole.doesUserHavePermission(
      UserRole.create(user.role as UserRoleEntries),
      UserRole.create(requiredRoles as UserRoleEntries),
    );
    // requiredRoles.includes(user.role);
  }
}
