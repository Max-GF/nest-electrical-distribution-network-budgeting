import {
  Avatar as PrismaAvatar,
  Base as PrismaBase,
  Company as PrismaCompany,
  User as PrismaUser,
} from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { User as DomainUser } from "src/domain/user-management/enterprise/entities/base-user";
import { Cpf } from "src/domain/user-management/enterprise/entities/value-objects/cpf";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { UserWithDetails } from "src/domain/user-management/enterprise/entities/value-objects/user-with-details";
import { PrismaBaseMapper } from "./prisma-base-mapper";
import { PrismaCompanyMapper } from "./prisma-company-mapper";
import { PrismaUserAvatarMapper } from "./prisma-user-avatar-mapper";

type PrismaUserWithDetails = PrismaUser & {
  company: PrismaCompany;
  base: PrismaBase;
  avatar: PrismaAvatar | null;
};

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): DomainUser {
    return DomainUser.create(
      {
        cpf: Cpf.create(raw.cpf),

        name: raw.name,
        email: raw.email,
        password: raw.password,
        role: UserRole.create(raw.role),

        companyId: new UniqueEntityID(raw.companyId),
        baseId: new UniqueEntityID(raw.baseId),

        isActive: raw.isActive,
        firstLogin: raw.firstLogin,

        avatarId: raw.avatarId ? new UniqueEntityID(raw.avatarId) : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toDomainWithDetails(raw: PrismaUserWithDetails): UserWithDetails {
    return UserWithDetails.create({
      id: raw.id,
      cpf: raw.cpf,

      name: raw.name,
      email: raw.email,
      role: raw.role,

      company: PrismaCompanyMapper.toDomain(raw.company),
      base: PrismaBaseMapper.toDomain(raw.base),

      isActive: raw.isActive,
      firstLogin: raw.firstLogin,

      avatar: raw.avatar
        ? PrismaUserAvatarMapper.toDomain(raw.avatar)
        : undefined,
    });
  }
  static toPrisma(raw: DomainUser): PrismaUser {
    return {
      id: raw.id.toString(),

      cpf: raw.cpf.value,

      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role.value,

      companyId: raw.companyId.toString(),
      baseId: raw.baseId.toString(),

      isActive: raw.isActive,
      firstLogin: raw.firstLogin,

      avatarId: raw.avatarId ? raw.avatarId.toString() : null,
    };
  }
}
