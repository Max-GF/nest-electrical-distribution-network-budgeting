import { Module } from "@nestjs/common";
import { NotificationsRepository } from "src/domain/notification/application/repositories/notifications-repository";
import { AvatarsRepository } from "src/domain/user-management/application/repositories/avatars-repository";
import { BasesRepository } from "src/domain/user-management/application/repositories/bases-repository";
import { CompaniesRepository } from "src/domain/user-management/application/repositories/companies-repository";
import { UsersRepository } from "src/domain/user-management/application/repositories/users-repository";
import { CacheModule } from "../cache/cache.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaNotificationsRepository } from "./prisma/repositories/notification/prisma-notifications-repository";
import { PrismaAvatarsRepository } from "./prisma/repositories/user-management/prisma-avatars-repository";
import { PrismaBasesRepository } from "./prisma/repositories/user-management/prisma-bases-repository";
import { PrismaCompaniesRepository } from "./prisma/repositories/user-management/prisma-companies-repository";
import { PrismaUsersRepository } from "./prisma/repositories/user-management/prisma-users-repository";

@Module({
  imports: [CacheModule],
  providers: [
    PrismaService,
    {
      provide: CompaniesRepository,
      useClass: PrismaCompaniesRepository,
    },
    {
      provide: BasesRepository,
      useClass: PrismaBasesRepository,
    },
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
    {
      provide: AvatarsRepository,
      useClass: PrismaAvatarsRepository,
    },
  ],
  exports: [
    PrismaService,
    CompaniesRepository,
    BasesRepository,
    UsersRepository,
    NotificationsRepository,
    AvatarsRepository,
  ],
})
export class DatabaseModule {}
