import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import {
  CreateBulkCableConnectorUseCaseRequest,
  CreateBulkOfCableConnectorsUseCase,
} from "./create-bulk-of-cable-connectors";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: CreateBulkOfCableConnectorsUseCase;

describe("Create a bulk of Cable Connectors", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository(
      inMemoryCablesRepository,
    );
    sut = new CreateBulkOfCableConnectorsUseCase(
      inMemoryCableConnectorsRepository,
      inMemoryCablesRepository,
    );
  });

  it("should be able to create a bulk of cable connectors and return failures correctly", async () => {
    const cable1 = makeCable({ code: 100 });
    const cable2 = makeCable({ code: 200 });
    await inMemoryCablesRepository.createMany([cable1, cable2]);

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);

    const cableConnectorsToCreate: CreateBulkCableConnectorUseCaseRequest[] =
      [];

    for (let i = 0; i < 5; i++) {
      cableConnectorsToCreate.push({
        code: i + 1,
        description: `Valid Connector ${i + 1}`,
        unit: "UN",
        entranceCablesOptionsCodes: [100],
        exitCablesOptionsCodes: [200],
      });

      cableConnectorsToCreate.push({
        code: i + 1,
        description: `Duplicated Code Connector ${i + 1}`,
        unit: "UN",
        entranceCablesOptionsCodes: [100],
      });

      cableConnectorsToCreate.push({
        code: 0,
        description: `Invalid Code Connector ${i + 1}`,
        unit: "UN",
        entranceCablesOptionsCodes: [100],
      });

      cableConnectorsToCreate.push({
        code: i + 1000,
        description: `Empty Entrance Connector ${i + 1}`,
        unit: "UN",
        entranceCablesOptionsCodes: [],
      });

      cableConnectorsToCreate.push({
        code: i + 2000,
        description: `Unregistered Cables Connector ${i + 1}`,
        unit: "UN",
        entranceCablesOptionsCodes: [9999],
      });
    }

    const result = await sut.execute(cableConnectorsToCreate);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.created).toHaveLength(5);
      expect(inMemoryCableConnectorsRepository.items).toHaveLength(5);

      expect(result.value.failed).toHaveLength(20);

      expect(
        result.value.failed.filter((item) =>
          item.error.message.includes(
            "already registered or duplicated in payload",
          ),
        ),
      ).toHaveLength(5);

      expect(
        result.value.failed.filter(
          (item) =>
            item.error.message ===
            "Cable Connector code must be greater than zero",
        ),
      ).toHaveLength(5);

      expect(
        result.value.failed.filter(
          (item) =>
            item.error.message ===
            "Cable Connector must have at least one entrance cable option",
        ),
      ).toHaveLength(5);

      expect(
        result.value.failed.filter((item) =>
          item.error.message.includes("Some cables are not registered"),
        ),
      ).toHaveLength(5);
    }
  });

  it("should not throw error when empty array is given", async () => {
    const cableConnectorsToCreate: CreateBulkCableConnectorUseCaseRequest[] =
      [];
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);

    const result = await sut.execute(cableConnectorsToCreate);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.created).toHaveLength(0);
      expect(result.value.failed).toHaveLength(0);
    }
  });
});
