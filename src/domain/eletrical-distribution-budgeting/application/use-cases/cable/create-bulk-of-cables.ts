import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { CablesRepository } from "../../repositories/cables-repository";
import { CreateCableUseCaseRequest } from "./create-cable";

interface FailedLog {
  error: AlreadyRegisteredError | NegativeCableSectionError | NotAllowedError;
  cable: CreateCableUseCaseRequest;
}

type CreateBulkOfCablesUseCaseResponse = Either<
  never,
  {
    failed: FailedLog[];
    created: Cable[];
  }
>;

@Injectable()
export class CreateBulkOfCablesUseCase {
  constructor(private cablesRepository: CablesRepository) {}

  async execute(
    cablesToCreate: CreateCableUseCaseRequest[],
  ): Promise<CreateBulkOfCablesUseCaseResponse> {
    if (cablesToCreate.length === 0) {
      return right({ failed: [], created: [] });
    }
    const failed: FailedLog[] = [];
    const created: Cable[] = [];
    const actualCodesInRepository = new Set(
      await this.cablesRepository.findAllCodes(),
    );

    for (const cableToCreate of cablesToCreate) {
      if (cableToCreate.sectionAreaInMM <= 0) {
        failed.push({
          error: new NegativeCableSectionError(
            "Cable section area must be greater than zero",
          ),
          cable: cableToCreate,
        });
        continue;
      }
      const upperCasedTension = cableToCreate.tension.toUpperCase();
      if (!TensionLevel.isValid(upperCasedTension)) {
        failed.push({
          error: new NegativeCableSectionError(
            `Invalid tension level: ${cableToCreate.tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
          ),
          cable: cableToCreate,
        });
        continue;
      }

      const { code, description, unit, sectionAreaInMM } = cableToCreate;
      if (actualCodesInRepository.has(code)) {
        failed.push({
          error: new AlreadyRegisteredError("Cable code already registered"),
          cable: cableToCreate,
        });
        continue;
      }
      const cable = Cable.create({
        code,
        description: description.toUpperCase(),
        unit: unit.toUpperCase(),
        tension: TensionLevel.create(upperCasedTension),
        sectionAreaInMM,
      });
      created.push(cable);
      actualCodesInRepository.add(code);
    }
    if (created.length === 0) {
      return right({ failed, created: [] });
    }
    await this.cablesRepository.createMany(created);
    return right({
      failed,
      created,
    });
  }
}
