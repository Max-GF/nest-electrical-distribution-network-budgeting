import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { CreateBulkOfCableConnectorsUseCase } from "./create-bulk-of-cable-connectors";
import { CreateCableConnectorUseCaseRequest } from "./create-cable-connector";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let sut: CreateBulkOfCableConnectorsUseCase;

describe("Create a bulk of Cable Connectors", () => {
  beforeEach(() => {
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository();
    sut = new CreateBulkOfCableConnectorsUseCase(
      inMemoryCableConnectorsRepository,
    );
  });

  it("should be able to create a bulk of cable connectors", async () => {
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    const cableConnectorsToCreate: CreateCableConnectorUseCaseRequest[] = [];
    for (let i = 0; i < 10; i++) {
      cableConnectorsToCreate.push({
        code: i + 1,
        description: `Cable Connector ${i + 1}`,
        unit: "MM",
        entranceMinValueMM: 1000 + i * 100,
        entranceMaxValueMM: 1001 + i * 100,
        exitMinValueMM: 1000 + i * 100,
        exitMaxValueMM: 1000 + i * 110,
      });
      cableConnectorsToCreate.push({
        code: i + 1000,
        description: `Cable Strap ${i + 1}`,
        unit: "MM",
        entranceMinValueMM: 1000 + i * 50,
        entranceMaxValueMM: 1001 + i * 50,
        exitMinValueMM: 0,
        exitMaxValueMM: 0,
      });
      cableConnectorsToCreate.push({
        code: i + 1,
        description: `Cable Connector ${i + 1}`,
        unit: "MM",
        entranceMinValueMM: 2000 + i * 100,
        entranceMaxValueMM: 2001 + i * 100,
        exitMinValueMM: 1000 + i * 100,
        exitMaxValueMM: 1001 + i * 110,
      });
      cableConnectorsToCreate.push({
        code: i + 2000,
        description: `Cable Connector ${i + 1}`,
        unit: "MM",
        entranceMinValueMM: -1,
        entranceMaxValueMM: 2000 + i * 100,
        exitMinValueMM: 1000 + i * 100,
        exitMaxValueMM: 1000 + i * 110,
      });
      cableConnectorsToCreate.push({
        code: i + 3000,
        description: `Cable Connector ${i + 1}`,
        unit: "MM",
        entranceMinValueMM: 2001 + i * 100,
        entranceMaxValueMM: 2000 + i * 100,
        exitMinValueMM: 1000 + i * 100,
        exitMaxValueMM: 1001 + i * 100,
      });
      cableConnectorsToCreate.push({
        code: i + 4000,
        description: `Cable Connector ${i + 1}`,
        unit: "MM",
        entranceMinValueMM: 2000 + i * 100,
        entranceMaxValueMM: 2001 + i * 100,
        exitMinValueMM: 1001 + i * 100,
        exitMaxValueMM: 1000 + i * 100,
      });
    }
    const result = await sut.execute(cableConnectorsToCreate);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(20);
    expect(result.value.created).toHaveLength(20);
    expect(result.value.failed).toHaveLength(40);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message === "Cable Connector code already registered",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "Cable Connector conections area must be greater than zero",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "Entrace maximum value must be greater than entrance minimum value",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "Exit maximum value must be greater than exit minimum value",
      ),
    ).toHaveLength(10);
  });
  it("should not throw error when empty array is given", async () => {
    const cableConnectorsToCreate: CreateCableConnectorUseCaseRequest[] = [];
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    await sut.execute(cableConnectorsToCreate);
  });
});
