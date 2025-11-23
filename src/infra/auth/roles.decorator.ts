import { SetMetadata } from '@nestjs/common';
import { UserRoleEntries } from 'src/domain/user-management/enterprise/entities/value-objects/user-roles';

export const ROLES_KEY = 'roles';
export const Roles = (roles: UserRoleEntries) => SetMetadata(ROLES_KEY, roles);

// If you want to use multiples roles, use the following line instead:
// export const Roles = (...roles: UserRoleEntries[]) => SetMetadata(ROLES_KEY, roles);