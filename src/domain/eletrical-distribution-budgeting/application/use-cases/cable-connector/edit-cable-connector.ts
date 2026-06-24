import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";
import { CablesRepository } from "../../repositories/cables-repository";

interface EditCableConnectorUseCaseRequest {
  cableConnectorId: string;
  description?: string;
  unit?: string;

  newEntranceCablesOptionsIds?: string[];
  newExitCablesOptionsIds?: string[];
}

type EditCableConnectorUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError | NotAllowedError,
  {
    cableConnector: CableConnector;
  }
>;

@Injectable()
export class EditCableConnectorUseCase {
  constructor(
    private cableConnectorsRepository: CableConnectorsRepository,
    private cablesRepository: CablesRepository,
  ) {}

  async execute(
    request: EditCableConnectorUseCaseRequest,
  ): Promise<EditCableConnectorUseCaseResponse> {
    let hasToEdit = false;

    if (this.noEntries(request)) {
      return left(new NotAllowedError("No entries provided"));
    }

    const {
      cableConnectorId,
      description,
      unit,
      newEntranceCablesOptionsIds,
      newExitCablesOptionsIds,
    } = request;

    if (
      newEntranceCablesOptionsIds &&
      newEntranceCablesOptionsIds.length === 0
    ) {
      return left(
        new NotAllowedError(
          "Cable Connector must have at least one entrance cable option",
        ),
      );
    }

    const cableConnectorToEdit =
      await this.cableConnectorsRepository.findById(cableConnectorId);

    if (!cableConnectorToEdit) {
      return left(
        new ResourceNotFoundError("Given cable connector was not found"),
      );
    }

    const cablesToSearch = new Set([
      ...(newEntranceCablesOptionsIds || []),
      ...(newExitCablesOptionsIds || []),
    ]);

    if (cablesToSearch.size > 0) {
      const cablesFound = await this.cablesRepository.findByIds(
        Array.from(cablesToSearch),
      );
      if (cablesFound.length !== cablesToSearch.size) {
        const foundCablesIds = new Set(cablesFound.map((c) => c.id.toString()));
        const missingCablesIds = Array.from(cablesToSearch).filter(
          (id) => !foundCablesIds.has(id),
        );
        return left(
          new ResourceNotFoundError(
            `The following cables were not found: ${missingCablesIds.join(", ")}`,
          ),
        );
      }
    }

    if (newEntranceCablesOptionsIds !== undefined) {
      const { added, removed } = cableConnectorToEdit.updateEntranceCable(
        newEntranceCablesOptionsIds.map((id) => new UniqueEntityID(id)),
      );
      if (added.length > 0 || removed.length > 0) {
        hasToEdit = true;
      }
    }

    if (newExitCablesOptionsIds !== undefined) {
      const { added, removed } = cableConnectorToEdit.updateExitCable(
        newExitCablesOptionsIds.map((id) => new UniqueEntityID(id)),
      );
      if (added.length > 0 || removed.length > 0) {
        hasToEdit = true;
      }
    }

    if (
      description &&
      description.toUpperCase() !== cableConnectorToEdit.description
    ) {
      cableConnectorToEdit.description = description.toUpperCase();
      hasToEdit = true;
    }

    if (unit && unit.toUpperCase() !== cableConnectorToEdit.unit) {
      cableConnectorToEdit.unit = unit.toUpperCase();
      hasToEdit = true;
    }

    if (hasToEdit) {
      await this.cableConnectorsRepository.save(cableConnectorToEdit);
    }

    return right({
      cableConnector: cableConnectorToEdit,
    });
  }

  noEntries(request: EditCableConnectorUseCaseRequest): boolean {
    return Object.entries(request)
      .filter(([key]) => key !== "cableConnectorId")
      .every(([, value]) => value === undefined);
  }
}
