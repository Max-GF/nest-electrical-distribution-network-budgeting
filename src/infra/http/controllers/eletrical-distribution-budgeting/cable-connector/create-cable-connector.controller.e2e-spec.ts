import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CableConnectorsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { CableFactory } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Create Cable Connector (E2E)", () => {
  let app: INestApplication;
  let cableConnectorsRepository: CableConnectorsRepository;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let cableFactory: CableFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        AccessTokenCreator,
        CompanyFactory,
        BaseFactory,
        UserFactory,
        CableFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    cableConnectorsRepository = moduleRef.get(CableConnectorsRepository);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    cableFactory = moduleRef.get(CableFactory);

    await app.init();
  });

  test("[POST] /cable-connectors", async () => {
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

    const entranceCable = await cableFactory.makePrismaCable({});
    const exitCable = await cableFactory.makePrismaCable({});

    const response = await request(app.getHttpServer())
      .post("/cable-connectors")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 12345,
        description: "CONECTOR PERFURANTE 10-95MM",
        unit: "UND",
        entranceCablesOptionsIds: [entranceCable.id.toString()],
        exitCablesOptionsIds: [exitCable.id.toString()],
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.cableConnector).toEqual(
      expect.objectContaining({
        code: 12345,
        description: "CONECTOR PERFURANTE 10-95MM",
        unit: "UND",
        entranceCablesOptionsIds: expect.arrayContaining([
          entranceCable.id.toString(),
        ]),
        exitCablesOptionsIds: expect.arrayContaining([exitCable.id.toString()]),
      }),
    );

    const cableConnectorOnDatabase =
      await cableConnectorsRepository.findByCode(12345);

    expect(cableConnectorOnDatabase).toBeTruthy();
    expect(cableConnectorOnDatabase?.code).toBe(12345);
  });

  test("[POST] /cable-connectors - should return 409 (Conflict) when code is already registered", async () => {
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

    const entranceCable = await cableFactory.makePrismaCable({});

    await request(app.getHttpServer())
      .post("/cable-connectors")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 99999,
        description: "FIRST CONNECTOR",
        unit: "UND",
        entranceCablesOptionsIds: [entranceCable.id.toString()],
      });

    const response = await request(app.getHttpServer())
      .post("/cable-connectors")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 99999,
        description: "DUPLICATED CODE CONNECTOR",
        unit: "UND",
        entranceCablesOptionsIds: [entranceCable.id.toString()],
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toEqual(
      "Cable Connector code already registered",
    );
  });

  test("[POST] /cable-connectors - should return 404 (Not Found) when some cable ID does not exist in DB", async () => {
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

    const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

    const response = await request(app.getHttpServer())
      .post("/cable-connectors")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 88888,
        description: "CONNECTOR WITH FAKE CABLE",
        unit: "UND",
        entranceCablesOptionsIds: [fakeUuid],
      });
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toContain(
      "Some cable ids are not registered",
    );
  });

  test("[POST] /cable-connectors - should return 422 (Unprocessable Entity) for business rule violation", async () => {
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

    const entranceCable = await cableFactory.makePrismaCable({});

    const response = await request(app.getHttpServer())
      .post("/cable-connectors")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 0,
        description: "CONNECTOR WITH INVALID CODE",
        unit: "UND",
        entranceCablesOptionsIds: [entranceCable.id.toString()],
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toEqual(
      "Cable Connector code must be greater than zero",
    );
  });
});
