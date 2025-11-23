import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";

export interface CreateCableConnectorUseCaseRequest {
  code: number;
  description: string;
  unit: string;

  entranceMinValueMM: number;
  entranceMaxValueMM: number;

  exitMinValueMM: number;
  exitMaxValueMM: number;
}

type CreateCableConnectorUseCaseResponse = Either<
  AlreadyRegisteredError | NegativeCableSectionError,
  {
    cableConnector: CableConnector;
  }
>;

@Injectable()
export class CreateCableConnectorUseCase {
  constructor(private cableConnectorsRepository: CableConnectorsRepository) {}

  async execute(
    cableConnectorToCreate: CreateCableConnectorUseCaseRequest,
  ): Promise<CreateCableConnectorUseCaseResponse> {
    if (this.oneLengthInfoIsLessThanZero(cableConnectorToCreate)) {
      return left(
        new NegativeCableSectionError(
          "Cable Connector entrance and exit section lengths must be greater than or equal to zero.",
        ),
      );
    }
    const {
      code,
      description,
      unit,
      entranceMaxValueMM,
      entranceMinValueMM,
      exitMaxValueMM,
      exitMinValueMM,
    } = cableConnectorToCreate;
    if (entranceMinValueMM > entranceMaxValueMM) {
      return left(
        new NotAllowedError(
          "Entrace maximum value must be greater than entrance minimum value",
        ),
      );
    }
    if (exitMinValueMM > exitMaxValueMM) {
      return left(
        new NotAllowedError(
          "Exit maximum value must be greater than exit minimum value",
        ),
      );
    }
    const cableConnectorWithSameCode =
      await this.cableConnectorsRepository.findByCode(code);
    if (cableConnectorWithSameCode) {
      return left(
        new AlreadyRegisteredError("Cable Connector code already registered"),
      );
    }

    const cableConnector = CableConnector.create({
      code,
      description: description.toUpperCase(),
      unit: unit.toUpperCase(),
      entranceMinValueMM,
      entranceMaxValueMM,
      exitMinValueMM,
      exitMaxValueMM,
    });
    await this.cableConnectorsRepository.createMany([cableConnector]);
    return right({
      cableConnector,
    });
  }
  oneLengthInfoIsLessThanZero(
    cableConnectorToCreate: CreateCableConnectorUseCaseRequest,
  ): boolean {
    return Object.entries(cableConnectorToCreate)
      .filter(
        ([key]) => key !== "code" && key !== "description" && key !== "unit",
      )
      .some(([, value]) => value < 0);
  }
}
