import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import {
  TensionLevel,
  TensionLevelEntries,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { CablesRepository } from "../../repositories/cables-repository";

interface EditCableUseCaseRequest {
  cableId: string;
  description?: string;
  unit?: string;

  tension?: string;
  sectionAreaInMM?: number;

  meterToKgConversionFactor?: number;
}

type EditCableUseCaseResponse = Either<
  | AlreadyRegisteredError
  | ResourceNotFoundError
  | NotAllowedError
  | NegativeCableSectionError,
  {
    cable: Cable;
  }
>;

@Injectable()
export class EditCableUseCase {
  constructor(private cablesRepository: CablesRepository) {}

  async execute(
    editCableUseCaseRequest: EditCableUseCaseRequest,
  ): Promise<EditCableUseCaseResponse> {
    let hasToEdit = false;

    if (this.noEntries(editCableUseCaseRequest)) {
      return left(new NotAllowedError("No entries provided"));
    }

    const {
      cableId,
      description,
      sectionAreaInMM,
      tension,
      unit,
      meterToKgConversionFactor,
    } = editCableUseCaseRequest;

    if (sectionAreaInMM && sectionAreaInMM <= 0) {
      return left(
        new NegativeCableSectionError(
          "Cable section area must be greater than zero",
        ),
      );
    }

    if (
      meterToKgConversionFactor !== undefined &&
      meterToKgConversionFactor <= 0
    ) {
      return left(
        new NotAllowedError(
          "Meter to kg conversion factor must be greater than zero",
        ),
      );
    }

    const upperCasedTension = tension ? tension.toUpperCase() : null;
    if (
      upperCasedTension !== null &&
      !TensionLevel.isValid(upperCasedTension)
    ) {
      return left(
        new NotAllowedError(
          `Invalid tension level: ${tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
        ),
      );
    }

    const upperCasedUnit = unit ? unit.toUpperCase() : null;
    if (
      upperCasedUnit !== null &&
      upperCasedUnit !== "M" &&
      upperCasedUnit !== "KG"
    ) {
      return left(
        new NotAllowedError(`Invalid unit: ${unit}. Valid values are: M, KG.`),
      );
    }

    const cableToEdit = await this.cablesRepository.findById(cableId);

    if (!cableToEdit) {
      return left(new ResourceNotFoundError("Given cable was not found"));
    }

    if (description && description.toUpperCase() !== cableToEdit.description) {
      cableToEdit.description = description.toUpperCase();
      hasToEdit = true;
    }
    if (sectionAreaInMM && sectionAreaInMM !== cableToEdit.sectionAreaInMM) {
      cableToEdit.sectionAreaInMM = sectionAreaInMM;
      hasToEdit = true;
    }
    if (upperCasedTension !== null) {
      cableToEdit.tension = TensionLevel.create(
        upperCasedTension as TensionLevelEntries,
      );
      hasToEdit = true;
    }
    if (upperCasedUnit !== null && upperCasedUnit !== cableToEdit.unit) {
      cableToEdit.unit = upperCasedUnit as "M" | "KG";
      if (cableToEdit.unit === "M") {
        cableToEdit.meterToKgConversionFactor = undefined;
      }
      hasToEdit = true;
    }
    if (
      meterToKgConversionFactor !== undefined &&
      meterToKgConversionFactor !== cableToEdit.meterToKgConversionFactor
    ) {
      cableToEdit.meterToKgConversionFactor = meterToKgConversionFactor;
      hasToEdit = true;
    }

    // Post-edit cross-validation
    if (
      cableToEdit.unit === "KG" &&
      cableToEdit.meterToKgConversionFactor === undefined
    ) {
      return left(
        new NotAllowedError(
          "Meter to kg conversion factor must be provided when unit is KG",
        ),
      );
    }

    if (hasToEdit) {
      await this.cablesRepository.save(cableToEdit);
    }
    return right({
      cable: cableToEdit,
    });
  }

  noEntries(editCableUseCaseRequest: EditCableUseCaseRequest): boolean {
    return Object.entries(editCableUseCaseRequest)
      .filter(([key]) => key !== "cableId")
      .every(([, value]) => value === undefined);
  }
}
