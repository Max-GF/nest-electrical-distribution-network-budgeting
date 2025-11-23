import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { EditCableConnectorUseCase } from "./edit-cable-connector";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let sut: EditCableConnectorUseCase;

describe("Edit CableConnector", () => {
  beforeEach(() => {
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository();
    sut = new EditCableConnectorUseCase(inMemoryCableConnectorsRepository);
  });

  it("should be able to edit a Cable Connector", async () => {
    const cableConnectorToEdit = makeCableConnector({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3001,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3001,
    });
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      description: "3500mm Cable Connector",
      unit: "UND",
      entranceMinValueMM: 3500,
      entranceMaxValueMM: 3501,
      exitMinValueMM: 3500,
      exitMaxValueMM: 3501,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCableConnectorsRepository.items[0]).toEqual(
        result.value.cableConnector,
      );
      expect(inMemoryCableConnectorsRepository.items[0].description).toBe(
        "3500MM CABLE CONNECTOR",
      );
      expect(inMemoryCableConnectorsRepository.items[0].unit).toBe("UND");
    }
  });

  it("should not be able to edit a cable connector with negative section length", async () => {
    const cableConnectorToEdit = makeCableConnector({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3001,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3001,
    });
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      description: "3500mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: -3500,
      entranceMaxValueMM: 3501,
      exitMinValueMM: 3500,
      exitMaxValueMM: 3501,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeCableSectionError);
      expect(result.value.message).toBe(
        "Cable Connector entrance and exit section lengths must be greater than or equal to zero.",
      );
    }
  });
  it("should not be able to edit a cable connector with invalid section length for entrance", async () => {
    const cableConnectorToEdit = makeCableConnector({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3001,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3001,
    });
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      description: "3500mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3501,
      entranceMaxValueMM: 3500,
      exitMinValueMM: 3500,
      exitMaxValueMM: 3501,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Cable Connector entrance max value must be greater than or equal to entrance min value.",
      );
    }
  });
  it("should not be able to edit a cable connector invalid section length for exit", async () => {
    const cableConnectorToEdit = makeCableConnector({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3001,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3001,
    });
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      description: "3500mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3500,
      entranceMaxValueMM: 3501,
      exitMinValueMM: 3501,
      exitMaxValueMM: 3500,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Cable Connector exit max value must be greater than or equal to exit min value.",
      );
    }
  });

  it("should not be able to edit unexisting cable connector", async () => {
    const result = await sut.execute({
      cableConnectorId: "unexisting-id",
      description: "3500mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3500,
      entranceMaxValueMM: 3501,
      exitMinValueMM: 3500,
      exitMaxValueMM: 3501,
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Given cable connector was not found");
    }
  });
  it("should not be able to edit a cable connector when no entries was given", async () => {
    const cableConnectorToEdit = makeCableConnector({
      code: 123456,
      description: "3000mm Cable Connector",
      unit: "MM",
      entranceMinValueMM: 3000,
      entranceMaxValueMM: 3001,
      exitMinValueMM: 3000,
      exitMaxValueMM: 3001,
    });
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);
    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
});
