import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { FetchWithFilterCableConnectorUseCase } from "./fetch-cable-connectors-with-filter-options";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: FetchWithFilterCableConnectorUseCase;

describe("Fetch cable connectors with options", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository(
      inMemoryCablesRepository,
    );
    sut = new FetchWithFilterCableConnectorUseCase(
      inMemoryCableConnectorsRepository,
    );
  });

  it("should be able to fetch cable connectors with different filters", async () => {
    const cableConnectorsToCreate: CableConnector[] = [];

    for (let i = 0; i < 40; i++) {
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 10 + i,
          description: `CABLE CONNECTOR ${i}`,
        }),
      );
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 1000 + i,
          description: `CABLE STRAP ${i}`,
        }),
      );
    }

    await inMemoryCableConnectorsRepository.createMany(cableConnectorsToCreate);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(80);

    const result1 = await sut.execute({ codes: [10, 11, 12] });

    const result2 = await sut.execute({ description: "cable strap" });

    const result3 = await sut.execute({ description: "   ", codes: [] });

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
  });

  it("should be able to fetch paginated cable connectors", async () => {
    const cableConnectorsToCreate: CableConnector[] = [];

    for (let i = 0; i < 10; i++) {
      cableConnectorsToCreate.push(
        makeCableConnector({
          code: 10 + i,
          description: `CABLE CONNECTOR ${i}`,
        }),
      );
    }

    await inMemoryCableConnectorsRepository.createMany(cableConnectorsToCreate);

    const result = await sut.execute({ page: 2, pageSize: 2 });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.cableConnectors).toHaveLength(2);
      expect(result.value.pagination.actualPage).toEqual(2);
      expect(result.value.pagination.actualPageSize).toEqual(2);
      expect(result.value.pagination.lastPage).toEqual(5);
    }
  });

  it("should not be able to fetch cable connectors with page less than or equal to zero", async () => {
    const result1 = await sut.execute({ page: 0 });
    const result2 = await sut.execute({ page: -1 });

    expect(result1.isLeft()).toBeTruthy();
    if (result1.isLeft()) {
      expect(result1.value).toBeInstanceOf(NotAllowedError);
      expect(result1.value.message).toBe("Page must be greater than zero");
    }

    expect(result2.isLeft()).toBeTruthy();
    if (result2.isLeft()) {
      expect(result2.value).toBeInstanceOf(NotAllowedError);
      expect(result2.value.message).toBe("Page must be greater than zero");
    }
  });

  it("should not be able to fetch cable connectors with page size less than or equal to zero", async () => {
    const result1 = await sut.execute({ pageSize: 0 });
    const result2 = await sut.execute({ pageSize: -5 });

    expect(result1.isLeft()).toBeTruthy();
    if (result1.isLeft()) {
      expect(result1.value).toBeInstanceOf(NotAllowedError);
      expect(result1.value.message).toBe("Page size must be greater than zero");
    }

    expect(result2.isLeft()).toBeTruthy();
    if (result2.isLeft()) {
      expect(result2.value).toBeInstanceOf(NotAllowedError);
      expect(result2.value.message).toBe("Page size must be greater than zero");
    }
  });
});
