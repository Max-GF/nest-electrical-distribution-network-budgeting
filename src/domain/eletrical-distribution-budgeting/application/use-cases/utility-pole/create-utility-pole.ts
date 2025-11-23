import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { UtilityPolesRepository } from "../../repositories/utility-poles-repository";

export interface CreateUtilityPoleUseCaseRequest {
  code: number;
  description: string;
  unit: string;

  strongSideSectionMultiplier: number;

  mediumVoltageLevelsCount: number;
  mediumVoltageStartSectionLengthInMM: number;
  mediumVoltageSectionLengthAddBylevelInMM: number;

  lowVoltageLevelsCount: number;
  lowVoltageStartSectionLengthInMM: number;
  lowVoltageSectionLengthAddBylevelInMM: number;
}

type CreateUtilityPoleUseCaseResponse = Either<
  AlreadyRegisteredError | NegativeScrewLengthError,
  {
    utilityPole: UtilityPole;
  }
>;

@Injectable()
export class CreateUtilityPoleUseCase {
  constructor(private utilityPolesRepository: UtilityPolesRepository) {}

  async execute(
    createUtilityPoleUseCaseRequest: CreateUtilityPoleUseCaseRequest,
  ): Promise<CreateUtilityPoleUseCaseResponse> {
    if (this.oneLengthInfoIsLessThanZero(createUtilityPoleUseCaseRequest)) {
      return left(
        new NegativeScrewLengthError(
          "One or more section length are less than zero",
        ),
      );
    }
    if (createUtilityPoleUseCaseRequest.strongSideSectionMultiplier < 1) {
      return left(
        new NotAllowedError(
          "Is not allowed to create a utility pole with strong side section multiplier less than 1",
        ),
      );
    }
    if (
      createUtilityPoleUseCaseRequest.lowVoltageLevelsCount +
        createUtilityPoleUseCaseRequest.mediumVoltageLevelsCount ===
      0
    ) {
      return left(
        new NotAllowedError("Utility pole must have at least one level count"),
      );
    }
    const { code, description, unit, ...otherProps } =
      createUtilityPoleUseCaseRequest;
    const utilityPoleWithSameCode =
      await this.utilityPolesRepository.findByCode(code);
    if (utilityPoleWithSameCode) {
      return left(
        new AlreadyRegisteredError("UtilityPole code already registered"),
      );
    }

    const utilityPole = UtilityPole.create({
      code,
      description: description.toUpperCase(),
      unit: unit.toUpperCase(),
      ...otherProps,
    });
    await this.utilityPolesRepository.createMany([utilityPole]);
    return right({
      utilityPole,
    });
  }
  oneLengthInfoIsLessThanZero(
    createUtilityPoleUseCaseRequest: CreateUtilityPoleUseCaseRequest,
  ): boolean {
    return Object.entries(createUtilityPoleUseCaseRequest)
      .filter(
        ([key]) => key !== "code" && key !== "description" && key !== "unit",
      )
      .some(([, value]) => value < 0);
  }
}
