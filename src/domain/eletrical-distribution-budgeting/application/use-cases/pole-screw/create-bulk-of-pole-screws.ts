import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { PoleScrewsRepository } from "../../repositories/pole-screws-repository";
import { CreatePoleScrewUseCaseRequest } from "./create-pole-screw";

interface FailedLog {
  error: AlreadyRegisteredError | NegativeScrewLengthError;
  poleScrew: CreatePoleScrewUseCaseRequest;
}

type CreateBulkOfPoleScrewsUseCaseResponse = Either<
  never,
  {
    failed: FailedLog[];
    created: PoleScrew[];
  }
>;

@Injectable()
export class CreateBulkOfPoleScrewsUseCase {
  constructor(private poleScrewsRepository: PoleScrewsRepository) {}

  async execute(
    poleScrewsToCreate: CreatePoleScrewUseCaseRequest[],
  ): Promise<CreateBulkOfPoleScrewsUseCaseResponse> {
    if (poleScrewsToCreate.length === 0) {
      return right({ failed: [], created: [] });
    }
    const failed: FailedLog[] = [];
    const created: PoleScrew[] = [];
    const actualCodesInRepository = new Set(
      await this.poleScrewsRepository.findAllCodes(),
    );

    for (const poleScrewToCreate of poleScrewsToCreate) {
      if (poleScrewToCreate.lengthInMM <= 0) {
        failed.push({
          error: new NegativeScrewLengthError(
            "Pole Screw length must be greater than zero",
          ),
          poleScrew: poleScrewToCreate,
        });
        continue;
      }
      const { code, description, unit, lengthInMM } = poleScrewToCreate;
      if (actualCodesInRepository.has(code)) {
        failed.push({
          error: new AlreadyRegisteredError(
            "PoleScrew code already registered",
          ),
          poleScrew: poleScrewToCreate,
        });
        continue;
      }
      const poleScrew = PoleScrew.create({
        code,
        description: description.toUpperCase(),
        unit: unit.toUpperCase(),
        lengthInMM,
      });
      created.push(poleScrew);
      actualCodesInRepository.add(code);
    }
    if (created.length === 0) {
      return right({ failed, created: [] });
    }
    await this.poleScrewsRepository.createMany(created);
    return right({
      failed,
      created,
    });
  }
}
