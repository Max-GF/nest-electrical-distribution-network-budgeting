import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { PoleScrewsRepository } from "../../repositories/pole-screws-repository";

export interface CreatePoleScrewUseCaseRequest {
  code: number;
  description: string;
  unit: string;

  lengthInMM: number;
}

type CreatePoleScrewUseCaseResponse = Either<
  AlreadyRegisteredError | NegativeScrewLengthError,
  {
    poleScrew: PoleScrew;
  }
>;

@Injectable()
export class CreatePoleScrewUseCase {
  constructor(private poleScrewsRepository: PoleScrewsRepository) {}

  async execute({
    code,
    description,
    unit,
    lengthInMM,
  }: CreatePoleScrewUseCaseRequest): Promise<CreatePoleScrewUseCaseResponse> {
    if (lengthInMM <= 0) {
      return left(
        new NegativeScrewLengthError(
          "Pole Screw length must be greater than zero",
        ),
      );
    }
    const poleScrewWithSameCode =
      await this.poleScrewsRepository.findByCode(code);
    if (poleScrewWithSameCode) {
      return left(
        new AlreadyRegisteredError("Pole Screw code already registered"),
      );
    }

    const poleScrew = PoleScrew.create({
      code,
      description: description.toUpperCase(),
      unit: unit.toUpperCase(),
      lengthInMM,
    });
    await this.poleScrewsRepository.createMany([poleScrew]);
    return right({
      poleScrew,
    });
  }
}
