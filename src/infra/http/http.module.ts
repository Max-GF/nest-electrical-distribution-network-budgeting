import { Module } from "@nestjs/common";
import { CalculateBudgetUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/budget/calculate-budget";
import { CreateBulkOfCableConnectorsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/create-bulk-of-cable-connectors";
import { CreateCableConnectorUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/create-cable-connector";
import { EditCableConnectorUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/edit-cable-connector";
import { FetchWithFilterCableConnectorUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/fetch-cable-connectors-with-filter-options";
import { CreateBulkOfCablesUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/create-bulk-of-cables";
import { CreateCableUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/create-cable";
import { EditCableUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/edit-cable";
import { FetchCablesWithFilterOptionsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/fetch-cables-with-filter-options";
import { CreateBulkOfGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/create-bulk-of-groups";
import { CreateGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/create-group";
import { EditGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/edit-group";
import { FetchGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/fetch-groups-with-filter-options";
import { CreateBulkOfMaterialsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/create-bulk-of-materials";
import { CreateMaterialUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/create-material";
import { EditMaterialUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/edit-material";
import { FetchWithFilterMaterialsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/fetch-materials-with-filter-options";
import { EditPointUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/edit-point";
import { GetProjectPointUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/get-points-by-project-id";
import { ValidateManyPointsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/validate-many-points";
import { CreateBulkOfPoleScrewsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/create-bulk-of-pole-screws";
import { CreatePoleScrewUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/create-pole-screw";
import { EditPoleScrewUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/edit-pole-screw";
import { FetchWithFilterPoleScrewUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/fetch-pole-screws-with-filter-options";
import { BuildProjectBudgetUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/build-project-budget";
import { CreateProjectUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/create-project";
import { EditProjectUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/edit-project";
import { FetchProjectsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/fetch-projects";
import { CreateBulkOfUtilityPolesUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/create-bulk-of-utility-poles";
import { CreateUtilityPoleUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/create-utility-pole";
import { EditUtilityPoleUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/edit-utility-pole";
import { FetchWithFilterUtilityPoleUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/fetch-utility-poles-with-filter";
import { ReadNotificationUseCase } from "src/domain/notification/application/use-cases/read-notification";
import { DownloadUserAvatarByIdUseCase } from "src/domain/user-management/application/use-cases/avatar/download-user-avatar";
import { UploadAndCreateUserAvatarUseCase } from "src/domain/user-management/application/use-cases/avatar/upload-and-create-user-avatar";
import { CreateBaseUseCase } from "src/domain/user-management/application/use-cases/base/create-base";
import { EditBaseUseCase } from "src/domain/user-management/application/use-cases/base/edit-base";
import { FetchBasesByCompanyIdUseCase } from "src/domain/user-management/application/use-cases/base/fetch-bases-by-company-id";
import { CreateCompanyUseCase } from "src/domain/user-management/application/use-cases/company/create-company";
import { EditCompanyUseCase } from "src/domain/user-management/application/use-cases/company/edit-company";
import { FetchCompaniesUseCase } from "src/domain/user-management/application/use-cases/company/fetch-companies";
import { FetchCompaniesWithBasesUseCase } from "src/domain/user-management/application/use-cases/company/fetch-companies-with-bases";
import { AuthenticateUserUseCase } from "src/domain/user-management/application/use-cases/user/authenticate-user";
import { EditUserUseCase } from "src/domain/user-management/application/use-cases/user/edit-user";
import { FetchUsersWithFilteredOptionsUseCase } from "src/domain/user-management/application/use-cases/user/fetch-users-with-filtered-options";
import { RefreshAccessTokenUseCase } from "src/domain/user-management/application/use-cases/user/refresh-access-token";
import { RegisterUserUseCase } from "src/domain/user-management/application/use-cases/user/register-user";
import { CacheModule } from "../cache/cache.module";
import { CryptographyModule } from "../cryptography/cryptography.module";
import { DatabaseModule } from "../database/database.module";
import { StorageModule } from "../storage/storage.module";
import { CalculateBudgetController } from "./controllers/eletrical-distribution-budgeting/budget/calculate-budget.controller";
import { CreateBulkOfCableConnectorsController } from "./controllers/eletrical-distribution-budgeting/cable-connector/create-bulk-of-cable-connectors.controller";
import { CreateCableConnectorController } from "./controllers/eletrical-distribution-budgeting/cable-connector/create-cable-connector.controller";
import { EditCableConnectorController } from "./controllers/eletrical-distribution-budgeting/cable-connector/edit-cable-connector.controller";
import { FetchCableConnectorsWithFilterOptionsController } from "./controllers/eletrical-distribution-budgeting/cable-connector/fetch-cable-connectors-with-filter-options.controller";
import { CreateBulkOfCablesController } from "./controllers/eletrical-distribution-budgeting/cable/create-bulk-of-cables.controller";
import { CreateCableController } from "./controllers/eletrical-distribution-budgeting/cable/create-cable.controller";
import { EditCableController } from "./controllers/eletrical-distribution-budgeting/cable/edit-cable.controller";
import { FetchCablesWithFilterOptionsController } from "./controllers/eletrical-distribution-budgeting/cable/fetch-cables-with-filter-options.controller";
import { CreateBulkOfGroupsController } from "./controllers/eletrical-distribution-budgeting/group/create-bulk-of-groups.controller";
import { CreateGroupController } from "./controllers/eletrical-distribution-budgeting/group/create-group.controller";
import { EditGroupController } from "./controllers/eletrical-distribution-budgeting/group/edit-group.controller";
import { FetchGroupsController } from "./controllers/eletrical-distribution-budgeting/group/fetch-groups.controller";
import { CreateBulkOfMaterialsController } from "./controllers/eletrical-distribution-budgeting/material/create-bulk-of-materials.controller";
import { CreateMaterialController } from "./controllers/eletrical-distribution-budgeting/material/create-material.controller";
import { EditMaterialController } from "./controllers/eletrical-distribution-budgeting/material/edit-material.controller";
import { FetchMaterialsWithFilterOptionsController } from "./controllers/eletrical-distribution-budgeting/material/fetch-materials-with-filter-options.controller";
import { EditPointController } from "./controllers/eletrical-distribution-budgeting/point/edit-point.controller";
import { GetPointsByProjectIdController } from "./controllers/eletrical-distribution-budgeting/point/get-points-by-project-id.controller";
import { ValidateManyPointsController } from "./controllers/eletrical-distribution-budgeting/point/validate-many-points.controller";
import { CreateBulkOfPoleScrewsController } from "./controllers/eletrical-distribution-budgeting/pole-screw/create-bulk-of-pole-screws.controller";
import { CreatePoleScrewController } from "./controllers/eletrical-distribution-budgeting/pole-screw/create-pole-screw.controller";
import { EditPoleScrewController } from "./controllers/eletrical-distribution-budgeting/pole-screw/edit-pole-screw.controller";
import { FetchPoleScrewsWithFilterOptionsController } from "./controllers/eletrical-distribution-budgeting/pole-screw/fetch-pole-screws-with-filter-options.controller";
import { BuildProjectBudgetController } from "./controllers/eletrical-distribution-budgeting/project/build-project-budget.controller";
import { CreateProjectController } from "./controllers/eletrical-distribution-budgeting/project/create-project.controller";
import { EditProjectController } from "./controllers/eletrical-distribution-budgeting/project/edit-project.controller";
import { FetchProjectsController } from "./controllers/eletrical-distribution-budgeting/project/fetch-projects.controller";
import { CreateBulkOfUtilityPolesController } from "./controllers/eletrical-distribution-budgeting/utility-pole/create-bulk-of-utility-poles.controller";
import { CreateUtilityPoleController } from "./controllers/eletrical-distribution-budgeting/utility-pole/create-utility-pole.controller";
import { EditUtilityPoleController } from "./controllers/eletrical-distribution-budgeting/utility-pole/edit-utility-pole.controller";
import { FetchUtilityPolesWithFilterOptionsController } from "./controllers/eletrical-distribution-budgeting/utility-pole/fetch-utility-poles-with-filter-options.controller";
import { ReadNotificationController } from "./controllers/notification/read-notification.controller";
import { DownloadUserAvatarByIdController } from "./controllers/user-management/avatar/download-user-avatar.controller";
import { UploadAndCreateUserAvatarController } from "./controllers/user-management/avatar/upload-and-create-user-avatar.controller";
import { CreateBaseController } from "./controllers/user-management/base/create-base.controller";
import { EditBaseController } from "./controllers/user-management/base/edit-base.controller";
import { FetchBasesByCompanyIdController } from "./controllers/user-management/base/fetch-base-by-company-id.controller";
import { CreateCompanyController } from "./controllers/user-management/company/create-company.controller";
import { EditCompanyController } from "./controllers/user-management/company/edit-company.controller";
import { FetchCompaniesWithBasesController } from "./controllers/user-management/company/fetch-companies-with-bases.controller";
import { FetchCompaniesController } from "./controllers/user-management/company/fetch-companies.controller";
import { TestGuardsController } from "./controllers/user-management/test-guards.controller";
import { AuthenticateUserController } from "./controllers/user-management/user/authenticate-user.controller";
import { EditUserController } from "./controllers/user-management/user/edit-user.controller";
import { FetchUsersWithFilteredOptionsController } from "./controllers/user-management/user/fetch-user-with-filtered-options.controller";
import { RefreshAccessTokenController } from "./controllers/user-management/user/refresh-access-token.controller";
import { RegisterUserController } from "./controllers/user-management/user/register-user.controller";

@Module({
  imports: [DatabaseModule, CryptographyModule, StorageModule, CacheModule],
  controllers: [
    CreateCompanyController,
    CreateBaseController,
    RegisterUserController,
    AuthenticateUserController,
    FetchCompaniesController,
    FetchBasesByCompanyIdController,
    FetchUsersWithFilteredOptionsController,
    ReadNotificationController,
    TestGuardsController,
    UploadAndCreateUserAvatarController,
    DownloadUserAvatarByIdController,
    EditBaseController,
    FetchCompaniesWithBasesController,
    EditCompanyController,
    EditUserController,
    RefreshAccessTokenController,
    CreateCableController,
    CreateBulkOfCablesController,
    EditCableController,
    FetchCablesWithFilterOptionsController,
    CreateUtilityPoleController,
    CreateBulkOfUtilityPolesController,
    EditUtilityPoleController,
    FetchUtilityPolesWithFilterOptionsController,
    CreateCableConnectorController,
    CreateBulkOfCableConnectorsController,
    EditCableConnectorController,
    FetchCableConnectorsWithFilterOptionsController,
    CreatePoleScrewController,
    CreateBulkOfPoleScrewsController,
    EditPoleScrewController,
    FetchPoleScrewsWithFilterOptionsController,
    CreateMaterialController,
    CreateBulkOfMaterialsController,
    EditMaterialController,
    FetchMaterialsWithFilterOptionsController,
    CreateGroupController,
    CreateBulkOfGroupsController,
    EditGroupController,
    FetchGroupsController,
    EditPointController,
    GetPointsByProjectIdController,
    ValidateManyPointsController,
    CalculateBudgetController,
    CreateProjectController,
    EditProjectController,
    FetchProjectsController,
    BuildProjectBudgetController,
  ],
  providers: [
    CreateCompanyUseCase,
    CreateBaseUseCase,
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    FetchCompaniesUseCase,
    FetchBasesByCompanyIdUseCase,
    FetchUsersWithFilteredOptionsUseCase,
    ReadNotificationUseCase,
    UploadAndCreateUserAvatarUseCase,
    DownloadUserAvatarByIdUseCase,
    EditBaseUseCase,
    FetchCompaniesWithBasesUseCase,
    EditCompanyUseCase,
    EditUserUseCase,
    RefreshAccessTokenUseCase,
    CreateCableUseCase,
    CreateBulkOfCablesUseCase,
    EditCableUseCase,
    FetchCablesWithFilterOptionsUseCase,
    CreateUtilityPoleUseCase,
    CreateBulkOfUtilityPolesUseCase,
    EditUtilityPoleUseCase,
    FetchWithFilterUtilityPoleUseCase,
    CreateCableConnectorUseCase,
    CreateBulkOfCableConnectorsUseCase,
    EditCableConnectorUseCase,
    FetchWithFilterCableConnectorUseCase,
    CreatePoleScrewUseCase,
    CreateBulkOfPoleScrewsUseCase,
    EditPoleScrewUseCase,
    FetchWithFilterPoleScrewUseCase,
    CreateMaterialUseCase,
    CreateBulkOfMaterialsUseCase,
    EditMaterialUseCase,
    FetchWithFilterMaterialsUseCase,
    CreateGroupUseCase,
    CreateBulkOfGroupUseCase,
    EditGroupUseCase,
    FetchGroupUseCase,
    EditPointUseCase,
    GetProjectPointUseCase,
    ValidateManyPointsUseCase,
    CalculateBudgetUseCase,
    CreateProjectUseCase,
    EditProjectUseCase,
    FetchProjectsUseCase,
    BuildProjectBudgetUseCase,
  ],
})
export class HttpModule {}
