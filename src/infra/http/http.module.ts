import { Module } from "@nestjs/common";
import { CreateBulkOfCablesUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/create-bulk-of-cables";
import { CreateCableUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/create-cable";
import { EditCableUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/edit-cable";
import { FetchCablesWithFilterOptionsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/fetch-cables-with-filter-options";
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
import { CreateBulkOfCablesController } from "./controllers/eletrical-distribution-budgeting/cable/create-bulk-of-cables.controller";
import { CreateCableController } from "./controllers/eletrical-distribution-budgeting/cable/create-cable.controller";
import { EditCableController } from "./controllers/eletrical-distribution-budgeting/cable/edit-cable.controller";
import { FetchCablesWithFilterOptionsController } from "./controllers/eletrical-distribution-budgeting/cable/fetch-cables-with-filter-options.controller";
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
  ],
})
export class HttpModule {}
