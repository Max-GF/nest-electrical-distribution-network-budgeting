import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";

interface EditCableConnectorUseCaseRequest {
  cableConnectorId: string;
  description?: string;
  unit?: string;

  entranceMinValueMM?: number;
  entranceMaxValueMM?: number;

  exitMinValueMM?: number;
  exitMaxValueMM?: number;
}

type EditCableConnectorUseCaseResponse = Either<
  | AlreadyRegisteredError
  | ResourceNotFoundError
  | NotAllowedError
  | NegativeCableSectionError,
  {
    cableConnector: CableConnector;
  }
>;

@Injectable()
export class EditCableConnectorUseCase {
  constructor(private cableConnectorsRepository: CableConnectorsRepository) {}

  async execute(
    editCableConnectorUseCaseRequest: EditCableConnectorUseCaseRequest,
  ): Promise<EditCableConnectorUseCaseResponse> {
    let hasToEdit = false;

    if (this.noEntries(editCableConnectorUseCaseRequest)) {
      return left(new NotAllowedError("No entries provided"));
    }
    if (this.oneLengthInfoIsLessThanZero(editCableConnectorUseCaseRequest)) {
      return left(
        new NegativeCableSectionError(
          "Cable Connector entrance and exit section lengths must be greater than or equal to zero.",
        ),
      );
    }

    const {
      cableConnectorId,
      description,
      unit,
      entranceMinValueMM,
      entranceMaxValueMM,
      exitMinValueMM,
      exitMaxValueMM,
    } = editCableConnectorUseCaseRequest;

    const cableConnectorToEdit =
      await this.cableConnectorsRepository.findById(cableConnectorId);

    if (!cableConnectorToEdit) {
      return left(
        new ResourceNotFoundError("Given cable connector was not found"),
      );
    }

    if (description && description !== cableConnectorToEdit.description) {
      cableConnectorToEdit.description = description.toUpperCase();
      hasToEdit = true;
    }
    if (
      entranceMinValueMM &&
      entranceMinValueMM !== cableConnectorToEdit.entranceMinValueMM
    ) {
      cableConnectorToEdit.entranceMinValueMM = entranceMinValueMM;
      hasToEdit = true;
    }
    if (
      entranceMaxValueMM &&
      entranceMaxValueMM !== cableConnectorToEdit.entranceMaxValueMM
    ) {
      if (entranceMaxValueMM < cableConnectorToEdit.entranceMinValueMM) {
        return left(
          new NotAllowedError(
            "Cable Connector entrance max value must be greater than or equal to entrance min value.",
          ),
        );
      }
      cableConnectorToEdit.entranceMaxValueMM = entranceMaxValueMM;
      hasToEdit = true;
    }
    if (
      exitMinValueMM &&
      exitMinValueMM !== cableConnectorToEdit.exitMinValueMM
    ) {
      cableConnectorToEdit.exitMinValueMM = exitMinValueMM;
      hasToEdit = true;
    }
    if (
      exitMaxValueMM &&
      exitMaxValueMM !== cableConnectorToEdit.exitMaxValueMM
    ) {
      if (exitMaxValueMM < cableConnectorToEdit.exitMinValueMM) {
        return left(
          new NotAllowedError(
            "Cable Connector exit max value must be greater than or equal to exit min value.",
          ),
        );
      }
      cableConnectorToEdit.exitMaxValueMM = exitMaxValueMM;
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

  noEntries(
    editCableConnectorUseCaseRequest: EditCableConnectorUseCaseRequest,
  ): boolean {
    return Object.entries(editCableConnectorUseCaseRequest)
      .filter(([key]) => key !== "cableConnectorId")
      .every(([, value]) => value === undefined);
  }
  oneLengthInfoIsLessThanZero(
    cableConnectorToEdit: EditCableConnectorUseCaseRequest,
  ): boolean {
    return Object.entries(cableConnectorToEdit)
      .filter(
        ([key]) =>
          key !== "cableConnectorId" && key !== "description" && key !== "unit",
      )
      .some(([, value]) => value < 0);
  }
}
