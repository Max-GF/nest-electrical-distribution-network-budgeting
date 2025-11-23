import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { FetchWithFilterCableConnectorUseCase } from "./fetch-cable-connectors-with-filter-options";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let sut: FetchWithFilterCableConnectorUseCase;

describe("Fetch cable connectors with options", () => {
  beforeEach(() => {
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository();
    sut = new FetchWithFilterCableConnectorUseCase(
      inMemoryCableConnectorsRepository,
    );
  });

  it("should be able to fetch cable connectors with diferent options", async () => {
    const cableConnectorsToCreate: CableConnector[] = [];

    for (let i = 0; i < 40; i++) {
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 10 + i,
          description: `CABLE CONNECTOR ${i}`,
          entranceMinValueMM: 100 + i,
          entranceMaxValueMM: 200 + i,
          exitMinValueMM: 100 + i,
          exitMaxValueMM: 200 + i,
        }),
      );
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 1000 + i,
          description: `CABLE STRAP ${i}`,
          entranceMinValueMM: 100 + i,
          entranceMaxValueMM: 200 + i,
          exitMinValueMM: 0,
          exitMaxValueMM: 0,
        }),
      );
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 2000 + i,
          description: `CABLE CONNECTOR ${i}`,
          entranceMinValueMM: 1000 + i,
          entranceMaxValueMM: 2000 + i,
          exitMinValueMM: 1000 + i,
          exitMaxValueMM: 2000 + i,
        }),
      );
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 3000 + i,
          description: `CABLE CONNECTOR ${i}`,
          entranceMinValueMM: 100 + i,
          entranceMaxValueMM: 200 + i,
          exitMinValueMM: 100 + i,
          exitMaxValueMM: 200 + i,
        }),
      );
    }
    await inMemoryCableConnectorsRepository.createMany(cableConnectorsToCreate);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(160);
    const result1 = await sut.execute({ codes: [10, 11, 12] });
    const result2 = await sut.execute({ description: "cable strap" });
    const result3 = await sut.execute({ entranceMinValueMM: 300 });
    const result4 = await sut.execute({ entranceMaxValueMM: 300 });
    const result5 = await sut.execute({ exitMinValueMM: 200 });
    const result6 = await sut.execute({ exitMaxValueMM: 250 });
    const result7 = await sut.execute({
      entranceMinValueMM: 100,
      entranceMaxValueMM: 250,
    });
    const result8 = await sut.execute({
      exitMinValueMM: 1000,
      exitMaxValueMM: 3000,
    });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(result1.value.cableConnectors).toHaveLength(3);
    }
    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.cableConnectors).toHaveLength(40);
    }
    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      expect(result3.value.cableConnectors).toHaveLength(40);
    }
    expect(result4.isRight()).toBeTruthy();
    if (result4.isRight()) {
      expect(result4.value.cableConnectors).toHaveLength(40);
      expect(result4.value.pagination.lastPage).toEqual(3);
    }
    expect(result5.isRight()).toBeTruthy();
    if (result5.isRight()) {
      expect(result5.value.cableConnectors).toHaveLength(40);
    }
    expect(result6.isRight()).toBeTruthy();
    if (result6.isRight()) {
      expect(result6.value.cableConnectors).toHaveLength(40);
      expect(result6.value.pagination.lastPage).toEqual(3);
    }
    expect(result7.isRight()).toBeTruthy();
    if (result7.isRight()) {
      expect(result7.value.cableConnectors).toHaveLength(40);
      expect(result7.value.pagination.lastPage).toEqual(3);
    }
    expect(result8.isRight()).toBeTruthy();
    if (result8.isRight()) {
      expect(result8.value.cableConnectors).toHaveLength(40);
    }
  });
});
