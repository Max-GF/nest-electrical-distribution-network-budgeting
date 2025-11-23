import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CompaniesRepository } from "src/domain/user-management/application/repositories/companies-repository";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { CacheRepository } from "../cache-repository";
import { CacheModule } from "../cache.module";

describe("Redis cache repository (E2E)", () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let cacheRepository: CacheRepository;
  let companiesRepository: CompaniesRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
      providers: [CompanyFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    companyFactory = moduleRef.get(CompanyFactory);
    cacheRepository = moduleRef.get(CacheRepository);
    companiesRepository = moduleRef.get(CompaniesRepository);

    await app.init();
  });

  it("should cache company", async () => {
    const company = await companyFactory.makePrismaCompany({});

    await companiesRepository.findById(company.id.toString());

    const cached = await cacheRepository.get(
      `company:id:${company.id.toString()}`,
    );
    expect(cached).toBeTruthy();
    expect(cached).toEqual(JSON.stringify(company));
  });
  it("should return cached company on subsequent calls", async () => {
    const company = await companyFactory.makePrismaCompany({});

    await cacheRepository.set(
      `company:id:${company.id.toString()}`,
      JSON.stringify({ empty: true }),
    );

    const cached = await companiesRepository.findById(company.id.toString());

    expect(cached).toBeTruthy();
    expect(cached).toEqual({ empty: true });
  });
  it("should reset cached company when saving the company", async () => {
    const company = await companyFactory.makePrismaCompany({});

    await cacheRepository.set(
      `company:id:${company.id.toString()}`,
      JSON.stringify({ empty: true }),
    );

    await companiesRepository.save(company);
    const cached = await cacheRepository.get(
      `company:id:${company.id.toString()}`,
    );
    expect(cached).toBeNull();
  });
});
