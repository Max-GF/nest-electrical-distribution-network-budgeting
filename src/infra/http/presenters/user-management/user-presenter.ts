import { User } from "src/domain/user-management/enterprise/entities/base-user";
import { UserWithDetails } from "src/domain/user-management/enterprise/entities/value-objects/user-with-details";

export class UserPresenter {
  static toHttp(user: User) {
    return {
      id: user.id.toString(),

      cpf: user.cpf.value,

      name: user.name,
      email: user.email,
      role: user.role.value,

      baseId: user.baseId.toString(),
      companyId: user.companyId.toString(),

      isActive: user.isActive,
      firstLogin: user.firstLogin,

      avatarId: user.avatarId ? user.avatarId.toString() : null,
    };
  }
  static toHttpWithDetails(user: UserWithDetails) {
    return {
      id: user.id.toString(),

      cpf: user.cpf,

      name: user.name,
      email: user.email,
      role: user.role,

      base: {
        id: user.base.id.toString(),
        name: user.base.name,
      },
      company: {
        id: user.company.id.toString(),
        name: user.company.name,
        cnpj: user.company.cnpj.value,
      },

      isActive: user.isActive,
      firstLogin: user.firstLogin,

      avatar: user.avatar
        ? {
            id: user.avatar.id,
            title: user.avatar.title,
            url: user.avatar.url,
          }
        : {},
    };
  }
}
