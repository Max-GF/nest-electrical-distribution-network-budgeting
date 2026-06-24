import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { EditCableConnectorUseCase } from "./edit-cable-connector";

let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: EditCableConnectorUseCase;

describe("Edit Cable Connector", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository(
      inMemoryCablesRepository,
    );
    sut = new EditCableConnectorUseCase(
      inMemoryCableConnectorsRepository,
      inMemoryCablesRepository,
    );
  });

  it("should be able to edit a Cable Connector's description, unit and cables", async () => {
    const oldCable = makeCable();
    const newEntranceCable = makeCable();
    const newExitCable = makeCable();

    await inMemoryCablesRepository.createMany([
      oldCable,
      newEntranceCable,
      newExitCable,
    ]);

    const cableConnectorToEdit = makeCableConnector({
      description: "OLD DESCRIPTION",
      unit: "MM",
      entranceCablesOptionsIds: [oldCable.id],
    });
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(1);

    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      description: "NEW DESCRIPTION",
      unit: "UND",
      newEntranceCablesOptionsIds: [newEntranceCable.id.toString()],
      newExitCablesOptionsIds: [newExitCable.id.toString()],
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const editedConnector = inMemoryCableConnectorsRepository.items[0];

      expect(editedConnector.description).toBe("NEW DESCRIPTION");
      expect(editedConnector.unit).toBe("UND");

      expect(
        editedConnector.entranceCablesOptionsIds[0].equals(newEntranceCable.id),
      ).toBeTruthy();
      expect(
        editedConnector.exitCablesOptionsIds?.[0].equals(newExitCable.id),
      ).toBeTruthy();

      expect(
        editedConnector.entranceCablesOptionsIds.some((id) =>
          id.equals(oldCable.id),
        ),
      ).toBeFalsy();
    }
  });

  it("should not be able to edit a cable connector when attempting to empty entrance cables", async () => {
    const cableConnectorToEdit = makeCableConnector();
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);

    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      newEntranceCablesOptionsIds: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Cable Connector must have at least one entrance cable option",
      );
    }
  });

  it("should not be able to edit with unexisting cable ids", async () => {
    const cableConnectorToEdit = makeCableConnector();
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);

    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
      newEntranceCablesOptionsIds: ["fake-cable-id"],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toContain(
        "The following cables were not found",
      );
    }
  });

  it("should not be able to edit an unexisting cable connector", async () => {
    const result = await sut.execute({
      cableConnectorId: "unexisting-id",
      description: "NEW DESCRIPTION",
    });

    expect(inMemoryCableConnectorsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Given cable connector was not found");
    }
  });

  it("should not be able to edit a cable connector when no entries was given", async () => {
    const cableConnectorToEdit = makeCableConnector();
    await inMemoryCableConnectorsRepository.createMany([cableConnectorToEdit]);

    const result = await sut.execute({
      cableConnectorId: cableConnectorToEdit.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
});
