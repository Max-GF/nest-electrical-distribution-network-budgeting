import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { UtilityPolesRepository } from "../../repositories/utility-poles-repository";

interface EditUtilityPoleUseCaseRequest {
  utilityPoleId: string;
  description?: string;
  unit?: string;

  strongSideSectionMultiplier?: number;

  mediumVoltageLevelsCount?: number;
  mediumVoltageStartSectionLengthInMM?: number;
  mediumVoltageSectionLengthAddBylevelInMM?: number;

  lowVoltageLevelsCount?: number;
  lowVoltageStartSectionLengthInMM?: number;
  lowVoltageSectionLengthAddBylevelInMM?: number;
}

type EditUtilityPoleUseCaseResponse = Either<
  | AlreadyRegisteredError
  | ResourceNotFoundError
  | NotAllowedError
  | NegativeScrewLengthError,
  {
    utilityPole: UtilityPole;
  }
>;

@Injectable()
export class EditUtilityPoleUseCase {
  constructor(private utilityPolesRepository: UtilityPolesRepository) {}

  async execute(
    editUtilityPoleUseCaseRequest: EditUtilityPoleUseCaseRequest,
  ): Promise<EditUtilityPoleUseCaseResponse> {
    let hasToEdit = false;

    if (this.noEntries(editUtilityPoleUseCaseRequest)) {
      return left(new NotAllowedError("No entries provided"));
    }
    if (this.oneLengthInfoIsLessThanZero(editUtilityPoleUseCaseRequest)) {
      return left(
        new NegativeScrewLengthError(
          "One or more section length values are less than zero",
        ),
      );
    }

    const {
      utilityPoleId,
      description,
      unit,
      strongSideSectionMultiplier,
      mediumVoltageLevelsCount,
      mediumVoltageStartSectionLengthInMM,
      mediumVoltageSectionLengthAddBylevelInMM,
      lowVoltageLevelsCount,
      lowVoltageStartSectionLengthInMM,
      lowVoltageSectionLengthAddBylevelInMM,
    } = editUtilityPoleUseCaseRequest;

    if (strongSideSectionMultiplier && strongSideSectionMultiplier < 1) {
      return left(
        new NotAllowedError(
          "Is not allowed to edit a utility pole with strong side section multiplier less than 1",
        ),
      );
    }

    const utilityPoleToEdit =
      await this.utilityPolesRepository.findById(utilityPoleId);

    if (!utilityPoleToEdit) {
      return left(
        new ResourceNotFoundError("Given utility pole was not found"),
      );
    }

    if (
      description &&
      description.toUpperCase() !== utilityPoleToEdit.description
    ) {
      utilityPoleToEdit.description = description.toUpperCase();
      hasToEdit = true;
    }

    if (
      strongSideSectionMultiplier &&
      strongSideSectionMultiplier !==
        utilityPoleToEdit.strongSideSectionMultiplier
    ) {
      utilityPoleToEdit.strongSideSectionMultiplier =
        strongSideSectionMultiplier;
      hasToEdit = true;
    }
    if (
      mediumVoltageLevelsCount !== undefined &&
      mediumVoltageLevelsCount !== utilityPoleToEdit.mediumVoltageLevelsCount
    ) {
      utilityPoleToEdit.mediumVoltageLevelsCount = mediumVoltageLevelsCount;
      hasToEdit = true;
    }
    if (
      mediumVoltageStartSectionLengthInMM !== undefined &&
      mediumVoltageStartSectionLengthInMM !==
        utilityPoleToEdit.mediumVoltageStartSectionLengthInMM
    ) {
      utilityPoleToEdit.mediumVoltageStartSectionLengthInMM =
        mediumVoltageStartSectionLengthInMM;
      hasToEdit = true;
    }
    if (
      mediumVoltageSectionLengthAddBylevelInMM !== undefined &&
      mediumVoltageSectionLengthAddBylevelInMM !==
        utilityPoleToEdit.mediumVoltageSectionLengthAddBylevelInMM
    ) {
      utilityPoleToEdit.mediumVoltageSectionLengthAddBylevelInMM =
        mediumVoltageSectionLengthAddBylevelInMM;
      hasToEdit = true;
    }
    if (
      lowVoltageLevelsCount !== undefined &&
      lowVoltageLevelsCount !== utilityPoleToEdit.lowVoltageLevelsCount
    ) {
      utilityPoleToEdit.lowVoltageLevelsCount = lowVoltageLevelsCount;
      hasToEdit = true;
    }
    if (
      lowVoltageStartSectionLengthInMM !== undefined &&
      lowVoltageStartSectionLengthInMM !==
        utilityPoleToEdit.lowVoltageStartSectionLengthInMM
    ) {
      utilityPoleToEdit.lowVoltageStartSectionLengthInMM =
        lowVoltageStartSectionLengthInMM;
      hasToEdit = true;
    }
    if (
      lowVoltageSectionLengthAddBylevelInMM !== undefined &&
      lowVoltageSectionLengthAddBylevelInMM !==
        utilityPoleToEdit.lowVoltageSectionLengthAddBylevelInMM
    ) {
      utilityPoleToEdit.lowVoltageSectionLengthAddBylevelInMM =
        lowVoltageSectionLengthAddBylevelInMM;
      hasToEdit = true;
    }
    if (
      utilityPoleToEdit.lowVoltageLevelsCount +
        utilityPoleToEdit.mediumVoltageLevelsCount ===
      0
    ) {
      return left(
        new NotAllowedError("Utility pole must have at least one level count"),
      );
    }
    if (unit && unit.toUpperCase() !== utilityPoleToEdit.unit) {
      utilityPoleToEdit.unit = unit.toUpperCase();
      hasToEdit = true;
    }

    if (hasToEdit) {
      await this.utilityPolesRepository.save(utilityPoleToEdit);
    }
    return right({
      utilityPole: utilityPoleToEdit,
    });
  }

  noEntries(
    editUtilityPoleUseCaseRequest: EditUtilityPoleUseCaseRequest,
  ): boolean {
    return Object.entries(editUtilityPoleUseCaseRequest)
      .filter(([key]) => key !== "utilityPoleId")
      .every(([, value]) => value === undefined);
  }
  oneLengthInfoIsLessThanZero(
    editUtilityPoleUseCaseRequest: EditUtilityPoleUseCaseRequest,
  ): boolean {
    return Object.entries(editUtilityPoleUseCaseRequest)
      .filter(
        ([key]) =>
          key !== "utilityPoleId" && key !== "description" && key !== "unit",
      )
      .some(([, value]) => value < 0);
  }
}
