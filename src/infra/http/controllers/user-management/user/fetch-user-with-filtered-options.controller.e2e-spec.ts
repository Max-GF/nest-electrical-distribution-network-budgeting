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

describe("Fetch user with filtered options (E2E)", () => {
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

  test("[GET] /accounts", async () => {
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
    const accessToken = accessTokenCreator.execute(user);

    const [testCompany1, testCompany2] =
      await companyFactory.makePrismaManyRandomCompanies({}, 2);

    const [randomBasesFromCompany1, randomBasesFromCompany2] =
      await Promise.all([
        baseFactory.makePrismaManyRandomBases(
          {
            companyId: testCompany1.id,
          },
          2,
        ),
        baseFactory.makePrismaManyRandomBases(
          {
            companyId: testCompany2.id,
          },
          2,
        ),
      ]);
    await Promise.all([
      userFactory.makePrismaManyRandomUsers(
        {
          role: UserRole.create("ADMIN"),
          isActive: true,
          baseId: randomBasesFromCompany1[0].id,
          companyId: testCompany1.id,
        },
        5,
      ),
      userFactory.makePrismaManyRandomUsers(
        {
          role: UserRole.create("COMMON"),
          isActive: true,
          baseId: randomBasesFromCompany1[0].id,
          companyId: testCompany1.id,
        },
        5,
      ),
      userFactory.makePrismaManyRandomUsers(
        {
          role: UserRole.create("ADMIN"),
          isActive: false,
          baseId: randomBasesFromCompany2[1].id,
          companyId: testCompany2.id,
        },
        10,
      ),
      userFactory.makePrismaManyRandomUsers(
        {
          role: UserRole.create("ADMIN"),
          isActive: false,
          baseId: randomBasesFromCompany2[1].id,
          companyId: testCompany2.id,
        },
        10,
      ),
      userFactory.makePrismaManyRandomUsers(
        {
          role: UserRole.create("ADMIN"),
          isActive: true,
          baseId: randomBasesFromCompany1[1].id,
          companyId: testCompany1.id,
        },
        10,
      ),
    ]);

    const [response1, response2, response3, response4] = await Promise.all([
      request(app.getHttpServer())
        .get(`/accounts?page=1&pageSize=40`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({}),
      request(app.getHttpServer())
        .get(
          `/accounts?companiesIds=${testCompany1.id.toString()}&roles=Common&page=1&pageSize=40`,
        )
        .set("Authorization", `Bearer ${accessToken}`)
        .send({}),
      request(app.getHttpServer())
        .get(
          `/accounts?companiesIds=${testCompany2.id.toString()}&roles=Common&page=1&pageSize=40`,
        )
        .set("Authorization", `Bearer ${accessToken}`)
        .send({}),
      request(app.getHttpServer())
        .get(
          `/accounts?companiesIds=${testCompany2.id.toString()}&page=1&pageSize=40`,
        )
        .set("Authorization", `Bearer ${accessToken}`)
        .send({}),
    ]);
    expect(await prismaService.user.findMany()).toHaveLength(41);
    expect(response1.statusCode).toBe(200);
    expect(response1.body.users).toHaveLength(40);
    expect(response2.statusCode).toBe(200);
    expect(response2.body.users).toHaveLength(5);
    expect(response3.statusCode).toBe(200);
    expect(response3.body.users).toHaveLength(0);
    expect(response4.statusCode).toBe(200);
    expect(response4.body.users).toHaveLength(20);
  });
});
