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

describe("Fetch companies (E2E)", () => {
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
    prismaService = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);

    await app.init();
  });

  test("[GET] /companies-with-bases", async () => {
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

    const testCompanies = await companyFactory.makePrismaManyRandomCompanies(
      {},
      10,
    );
    testCompanies.forEach(async (company) => {
      await baseFactory.makePrismaManyRandomBases({ companyId: company.id }, 5);
    });
    expect(await prismaService.company.findMany()).toHaveLength(11);
    const accessToken = accessTokenCreator.execute(user);
    const response = await request(app.getHttpServer())
      .get("/companies-with-bases")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(200);
    response.body.companies.forEach((company) => {
      if (company.id === user.companyId.toString()) {
        expect(company.bases).toHaveLength(1);
        expect(company.bases[0].id).toBe(user.baseId.toString());
      } else {
        expect(company.bases).toHaveLength(5);
      }
    });
  });
});
