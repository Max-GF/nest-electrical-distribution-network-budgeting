import { Module } from "@nestjs/common";
import { CableConnectorsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { CablesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { GroupItemsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/group-items-repository";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { PointsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/points-repository";
import { PoleScrewsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/pole-screws-repository";
import { ProjectsBudgetRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/projects-budget-repository";
import { ProjectsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/projects-repository";
import { UtilityPolesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { NotificationsRepository } from "src/domain/notification/application/repositories/notifications-repository";
import { AvatarsRepository } from "src/domain/user-management/application/repositories/avatars-repository";
import { BasesRepository } from "src/domain/user-management/application/repositories/bases-repository";
import { CompaniesRepository } from "src/domain/user-management/application/repositories/companies-repository";
import { UsersRepository } from "src/domain/user-management/application/repositories/users-repository";
import { CacheModule } from "../cache/cache.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaCableConnectorsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-cable-connectors-repository";
import { PrismaCablesRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-cables-repository";
import { PrismaGroupItemsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-group-items-repository";
import { PrismaGroupsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-groups-repository";
import { PrismaMaterialsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-materials-repository";
import { PrismaPointsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-points-repository";
import { PrismaPoleScrewsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-pole-screws-repository";
import { PrismaProjectsBudgetRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-projects-budget-repository";
import { PrismaProjectsRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-projects-repository";
import { PrismaUtilityPolesRepository } from "./prisma/repositories/eletrical-distribution-budgeting/prisma-utility-poles-repository";
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
    {
      provide: ProjectsRepository,
      useClass: PrismaProjectsRepository,
    },
    {
      provide: MaterialsRepository,
      useClass: PrismaMaterialsRepository,
    },
    {
      provide: UtilityPolesRepository,
      useClass: PrismaUtilityPolesRepository,
    },
    {
      provide: CablesRepository,
      useClass: PrismaCablesRepository,
    },
    {
      provide: CableConnectorsRepository,
      useClass: PrismaCableConnectorsRepository,
    },
    {
      provide: PoleScrewsRepository,
      useClass: PrismaPoleScrewsRepository,
    },
    {
      provide: GroupsRepository,
      useClass: PrismaGroupsRepository,
    },
    {
      provide: GroupItemsRepository,
      useClass: PrismaGroupItemsRepository,
    },
    {
      provide: PointsRepository,
      useClass: PrismaPointsRepository,
    },
    {
      provide: ProjectsBudgetRepository,
      useClass: PrismaProjectsBudgetRepository,
    },
  ],
  exports: [
    PrismaService,
    CompaniesRepository,
    BasesRepository,
    UsersRepository,
    NotificationsRepository,
    AvatarsRepository,
    ProjectsRepository,
    MaterialsRepository,
    UtilityPolesRepository,
    CablesRepository,
    CableConnectorsRepository,
    PoleScrewsRepository,
    GroupsRepository,
    GroupItemsRepository,
    PointsRepository,
    ProjectsBudgetRepository,
  ],
})
export class DatabaseModule {}
