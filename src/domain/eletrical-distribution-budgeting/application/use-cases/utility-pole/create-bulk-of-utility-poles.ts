import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { UtilityPolesRepository } from "../../repositories/utility-poles-repository";
import { CreateUtilityPoleUseCaseRequest } from "./create-utility-pole";

interface FailedLog {
  error: AlreadyRegisteredError | NegativeScrewLengthError;
  utilityPole: CreateUtilityPoleUseCaseRequest;
}

type CreateBulkOfUtilityPolesUseCaseResponse = Either<
  never,
  {
    failed: FailedLog[];
    created: UtilityPole[];
  }
>;

@Injectable()
export class CreateBulkOfUtilityPolesUseCase {
  constructor(private utilityPolesRepository: UtilityPolesRepository) {}

  async execute(
    utilityPolesToCreate: CreateUtilityPoleUseCaseRequest[],
  ): Promise<CreateBulkOfUtilityPolesUseCaseResponse> {
    if (utilityPolesToCreate.length === 0) {
      return right({ failed: [], created: [] });
    }
    const failed: FailedLog[] = [];
    const created: UtilityPole[] = [];
    const actualCodesInRepository = new Set(
      await this.utilityPolesRepository.findAllCodes(),
    );

    for (const utilityPoleToCreate of utilityPolesToCreate) {
      if (this.oneLengthInfoIsLessThanZero(utilityPoleToCreate)) {
        failed.push({
          error: new NegativeScrewLengthError(
            "One or more section length are less than zero",
          ),
          utilityPole: utilityPoleToCreate,
        });
        continue;
      }
      if (utilityPoleToCreate.strongSideSectionMultiplier < 1) {
        failed.push({
          error: new NotAllowedError(
            "Is not allowed to create a utility pole with strong side section multiplier less than 1",
          ),
          utilityPole: utilityPoleToCreate,
        });
        continue;
      }
      if (
        utilityPoleToCreate.lowVoltageLevelsCount +
          utilityPoleToCreate.mediumVoltageLevelsCount ===
        0
      ) {
        failed.push({
          error: new NotAllowedError(
            "Utility pole must have at least one level count",
          ),
          utilityPole: utilityPoleToCreate,
        });
        continue;
      }
      const { code, description, unit, ...othersProps } = utilityPoleToCreate;
      if (actualCodesInRepository.has(code)) {
        failed.push({
          error: new AlreadyRegisteredError(
            "UtilityPole code already registered",
          ),
          utilityPole: utilityPoleToCreate,
        });
        continue;
      }
      const utilityPole = UtilityPole.create({
        code,
        description: description.toUpperCase(),
        unit: unit.toUpperCase(),
        ...othersProps,
      });
      created.push(utilityPole);
      actualCodesInRepository.add(code);
    }
    if (created.length === 0) {
      return right({ failed, created: [] });
    }
    await this.utilityPolesRepository.createMany(created);
    return right({
      failed,
      created,
    });
  }
  oneLengthInfoIsLessThanZero(
    utilityPoleToCreate: CreateUtilityPoleUseCaseRequest,
  ): boolean {
    return Object.entries(utilityPoleToCreate)
      .filter(
        ([key]) => key !== "code" && key !== "description" && key !== "unit",
      )
      .some(([, value]) => value < 0);
  }
}
