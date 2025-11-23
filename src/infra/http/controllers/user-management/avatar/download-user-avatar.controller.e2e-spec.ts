import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { StorageModule } from "src/infra/storage/storage.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";
import { UserAvatarFactory } from "test/factories/user-management/make-user-avatar";

describe("Download user avatar (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let userAvatarFactory: UserAvatarFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, StorageModule],
      providers: [
        AccessTokenCreator,
        CompanyFactory,
        BaseFactory,
        UserFactory,
        UserAvatarFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    userAvatarFactory = moduleRef.get(UserAvatarFactory);

    await app.init();
  });

  test("[POST] /avatars/:id", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      companyId: testCompany.id,
    });
    const user = await userFactory.makePrismaUser({
      role: UserRole.create("ADMIN"),
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const accessToken = accessTokenCreator.execute(user);

    const userAvatar = await userAvatarFactory.makePrismaUserAvatar({
      title: "Sample Avatar",
    });

    const response = await request(app.getHttpServer())
      .get(`/avatars/${userAvatar.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Buffer);
  });
});
