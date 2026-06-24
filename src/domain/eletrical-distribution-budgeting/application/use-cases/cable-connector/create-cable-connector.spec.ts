import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { CreateCableConnectorUseCase } from "./create-cable-connector";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: CreateCableConnectorUseCase;

describe("Create Cable Connector", () => {
  beforeEach(() => {
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository();
    inMemoryCablesRepository = new InMemoryCablesRepository();
    sut = new CreateCableConnectorUseCase(
      inMemoryCableConnectorsRepository,
      inMemoryCablesRepository,
    );
  });

  it("should be able to create a cable connector", async () => {
    const cable1 = makeCable();
    const cable2 = makeCable();
    await inMemoryCablesRepository.createMany([cable1, cable2]);

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);

    const result = await sut.execute({
      code: 123456,
      description: "Cable Connector X",
      unit: "UN",
      entranceCablesOptionsIds: [cable1.id.toString()],
      exitCablesOptionsIds: [cable2.id.toString()],
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);

    if (result.isRight()) {
      expect(inMemoryCableConnectorsRepository.items[0]).toEqual(
        result.value.cableConnector,
      );
      expect(
        inMemoryCableConnectorsRepository.items[0].entranceCablesOptionsIds[0].toString(),
      ).toBe(cable1.id.toString());
    }
  });

  it("should be able to create a cable connector - strap test (no exit cables)", async () => {
    const cable1 = makeCable();
    await inMemoryCablesRepository.createMany([cable1]);

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);

    const result = await sut.execute({
      code: 123456,
      description: "Cable Strap",
      unit: "UN",
      entranceCablesOptionsIds: [cable1.id.toString()],
      exitCablesOptionsIds: [],
    });
    const result2 = await sut.execute({
      code: 654321,
      description: "Cable Strap - 2",
      unit: "UN",
      entranceCablesOptionsIds: [cable1.id.toString()],
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(2);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.cableConnector).toEqual(
        inMemoryCableConnectorsRepository.items[0],
      );
    }
    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.cableConnector).toEqual(
        inMemoryCableConnectorsRepository.items[1],
      );
    }
  });

  it("should not be able to create a cable connector with code less than or equal to zero", async () => {
    const result = await sut.execute({
      code: 0,
      description: "Invalid Connector",
      unit: "UN",
      entranceCablesOptionsIds: ["fake-id"],
    });

    expect(result.isLeft()).toBeTruthy();
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Cable Connector code must be greater than zero",
      );
    }
  });

  it("should not be able to create a cable connector without entrance cable options", async () => {
    const result = await sut.execute({
      code: 123456,
      description: "Invalid Connector",
      unit: "UN",
      entranceCablesOptionsIds: [],
    });

    expect(result.isLeft()).toBeTruthy();

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Cable Connector must have at least one entrance cable option",
      );
    }
  });

  it("should not be able to create a cable connector if some cable ID is not registered", async () => {
    const cable1 = makeCable();
    await inMemoryCablesRepository.createMany([cable1]);

    const result = await sut.execute({
      code: 123456,
      description: "Cable Connector X",
      unit: "UN",
      entranceCablesOptionsIds: [cable1.id.toString(), "non-existent-id"],
    });

    expect(result.isLeft()).toBeTruthy();

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toContain(
        "Some cable ids are not registered",
      );
    }
  });

  it("should not be able to create two or more cable connectors with same code", async () => {
    const alreadyRegisteredConnector = makeCableConnector({ code: 123456 });
    await inMemoryCableConnectorsRepository.createMany([
      alreadyRegisteredConnector,
    ]);

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);

    const result = await sut.execute({
      code: 123456,
      description: "Duplicated Code Connector",
      unit: "UN",
      entranceCablesOptionsIds: ["any-id"],
    });

    expect(result.isLeft()).toBeTruthy();
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe(
        "Cable Connector code already registered",
      );
    }
  });
});
