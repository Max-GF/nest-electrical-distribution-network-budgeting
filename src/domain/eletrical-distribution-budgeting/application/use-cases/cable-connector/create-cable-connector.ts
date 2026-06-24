import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";
import { CablesRepository } from "../../repositories/cables-repository";

export interface CreateCableConnectorUseCaseRequest {
  code: number;
  description: string;
  unit: string;

  entranceCablesOptionsIds: string[];
  exitCablesOptionsIds?: string[];
}

type CreateCableConnectorUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError | NotAllowedError,
  {
    cableConnector: CableConnector;
  }
>;

@Injectable()
export class CreateCableConnectorUseCase {
  constructor(
    private cableConnectorsRepository: CableConnectorsRepository,
    private cablesRepository: CablesRepository,
  ) {}

  async execute(
    cableConnectorToCreate: CreateCableConnectorUseCaseRequest,
  ): Promise<CreateCableConnectorUseCaseResponse> {
    if (cableConnectorToCreate.code <= 0) {
      return left(
        new NotAllowedError("Cable Connector code must be greater than zero"),
      );
    }
    if (cableConnectorToCreate.entranceCablesOptionsIds.length === 0) {
      return left(
        new NotAllowedError(
          "Cable Connector must have at least one entrance cable option",
        ),
      );
    }
    const {
      code,
      description,
      unit,
      entranceCablesOptionsIds,
      exitCablesOptionsIds,
    } = cableConnectorToCreate;

    const cableConnectorWithSameCode =
      await this.cableConnectorsRepository.findByCode(code);
    if (cableConnectorWithSameCode) {
      return left(
        new AlreadyRegisteredError("Cable Connector code already registered"),
      );
    }
    const cablesIds = new Set([
      ...entranceCablesOptionsIds,
      ...(exitCablesOptionsIds || []),
    ]);
    const cables = await this.cablesRepository.findByIds(Array.from(cablesIds));
    const registeredCablesIds = new Set(cables.map((c) => c.id.toString()));
    const missingCablesIds = Array.from(cablesIds).filter(
      (id) => !registeredCablesIds.has(id),
    );
    if (missingCablesIds.length > 0) {
      return left(
        new ResourceNotFoundError(
          `Some cable ids are not registered: ${missingCablesIds.join(", ")}`,
        ),
      );
    }

    const cableConnector = CableConnector.create({
      code,
      description: description.toUpperCase(),
      unit: unit.toUpperCase(),
      entranceCablesOptionsIds: entranceCablesOptionsIds.map(
        (id) => new UniqueEntityID(id),
      ),
      exitCablesOptionsIds:
        exitCablesOptionsIds?.map((id) => new UniqueEntityID(id)) || [],
    });
    await this.cableConnectorsRepository.createMany([cableConnector]);
    return right({
      cableConnector,
    });
  }
}
