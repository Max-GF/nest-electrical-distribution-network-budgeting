import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { CreateCableConnectorUseCase } from "./create-cable-connector";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let sut: CreateCableConnectorUseCase;

describe("Create Cable Connector", () => {
  beforeEach(() => {
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository();
    sut = new CreateCableConnectorUseCase(inMemoryCableConnectorsRepository);
  });

  it("should be able to create a cable connector", async () => {
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3000,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3000,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCableConnectorsRepository.items[0]).toEqual(
        result.value.cableConnector,
      );
    }
  });
  it("should be able to create a cable connector - strap test", async () => {
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable Strap",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3000,
      exitMinValueMM: 0,
      exitMaxValueMM: 0,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCableConnectorsRepository.items[0]).toEqual(
        result.value.cableConnector,
      );
    }
  });

  it("should not be able to create a cable connector with negative length", async () => {
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: -3000,
      entranceMaxValueMM: 3000,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3000,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeCableSectionError);
      expect(result.value.message).toBe(
        "Cable Connector entrance and exit section lengths must be greater than or equal to zero.",
      );
    }
  });
  it("should not be able to create a cable connector with entrance min value greater than max value", async () => {
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3001,
      entranceMaxValueMM: 3000,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3000,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Entrace maximum value must be greater than entrance minimum value",
      );
    }
  });
  it("should not be able to create a cable connector with exit min value greater than max value", async () => {
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3000,
      exitMinValueMM: 3001,
      exitMaxValueMM: 3000,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Exit maximum value must be greater than exit minimum value",
      );
    }
  });

  it("should not be able to create two or more cable connectors with same code", async () => {
    const alreadyRegisteredPoleScrew = makeCableConnector({
      code: 123456,
    });
    await inMemoryCableConnectorsRepository.createMany([
      alreadyRegisteredPoleScrew,
    ]);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3000,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3000,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe(
        "Cable Connector code already registered",
      );
    }
  });
});
