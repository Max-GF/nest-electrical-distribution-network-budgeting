import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CableConnectorsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { CablesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { CableFactory } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Edit Cable Connector (E2E)", () => {
  let app: INestApplication;
  let cableConnectorsRepository: CableConnectorsRepository;
  let cablesRepository: CablesRepository;
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
    cablesRepository = moduleRef.get(CablesRepository);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    cableFactory = moduleRef.get(CableFactory);

    await app.init();
  });

  test("[PUT] /cable-connectors/:id", async () => {
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

    const oldCable = await cableFactory.makePrismaCable({});
    const newCable = await cableFactory.makePrismaCable({});
    console.log(await cablesRepository.findById(oldCable.id.toString()));
    console.log(await cablesRepository.findById(newCable.id.toString()));
    expect(
      await cablesRepository.findById(oldCable.id.toString()),
    ).toBeTruthy();

    const cableConnector = makeCableConnector({
      code: 12345,
      entranceCablesOptionsIds: [oldCable.id],
      exitCablesOptionsIds: [],
    });
    await cableConnectorsRepository.createMany([cableConnector]);

    const response = await request(app.getHttpServer())
      .put(`/cable-connectors/${cableConnector.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "NEW DESCRIPTION",
        newEntranceCablesOptionsIds: [newCable.id.toString()],
        newExitCablesOptionsIds: [oldCable.id.toString()],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.cableConnector).toEqual(
      expect.objectContaining({
        code: 12345,
        description: "NEW DESCRIPTION",
        entranceCablesOptionsIds: expect.arrayContaining([
          newCable.id.toString(),
        ]),
        exitCablesOptionsIds: expect.arrayContaining([oldCable.id.toString()]),
      }),
    );

    const cableConnectorOnDatabase =
      await cableConnectorsRepository.findByCode(12345);

    expect(cableConnectorOnDatabase).toBeTruthy();
    expect(cableConnectorOnDatabase?.description).toBe("NEW DESCRIPTION");
    expect(
      cableConnectorOnDatabase?.entranceCablesOptionsIds[0].toString(),
    ).toBe(newCable.id.toString());
    expect(
      (cableConnectorOnDatabase?.exitCablesOptionsIds ?? [""])[0].toString(),
    ).toBe(oldCable.id.toString());
  });
});
