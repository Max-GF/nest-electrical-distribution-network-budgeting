import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";
import { BasePresenter } from "../../../presenters/user-management/base-presenter";

describe("Fetch bases by company id (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccessTokenCreator, CompanyFactory, BaseFactory, UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    prismaService = moduleRef.get(PrismaService);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);

    await app.init();
  });

  test("[GET] /bases/:companyId", async () => {
    const company = await companyFactory.makePrismaCompany({});
    const base = await baseFactory.makePrismaBase({
      companyId: company.id,
    });
    const user = await userFactory.makePrismaUser({
      role: UserRole.create("ADMIN"),
      isActive: true,
      firstLogin: false,
      baseId: base.id,
      companyId: company.id,
    });

    const [testCompany1, testCompany2] =
      await companyFactory.makePrismaManyRandomCompanies({}, 2);

    const [randomBasesFromCompany1, _] = await Promise.all([
      baseFactory.makePrismaManyRandomBases(
        {
          companyId: testCompany1.id,
        },
        20,
      ),
      baseFactory.makePrismaManyRandomBases(
        {
          companyId: testCompany2.id,
        },
        20,
      ),
    ]);

    const accessToken = accessTokenCreator.execute(user);
    const response = await request(app.getHttpServer())
      .get(`/bases/${testCompany1.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(200);
    expect(response.body.bases).toHaveLength(20);
    expect(await prismaService.base.findMany()).toHaveLength(41);
    expect(response.body).toEqual(
      expect.objectContaining({
        bases: expect.arrayContaining(
          randomBasesFromCompany1.map(BasePresenter.toHttp),
        ),
      }),
    );
  });
});
