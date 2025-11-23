import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { CablesRepository } from "../../repositories/cables-repository";

export interface CreateCableUseCaseRequest {
  code: number;
  description: string;
  unit: string;

  tension: string;
  sectionAreaInMM: number;
}

type CreateCableUseCaseResponse = Either<
  AlreadyRegisteredError | NegativeCableSectionError | NotAllowedError,
  {
    cable: Cable;
  }
>;

@Injectable()
export class CreateCableUseCase {
  constructor(private cablesRepository: CablesRepository) {}

  async execute({
    code,
    description,
    unit,
    tension,
    sectionAreaInMM,
  }: CreateCableUseCaseRequest): Promise<CreateCableUseCaseResponse> {
    if (sectionAreaInMM <= 0) {
      return left(
        new NegativeCableSectionError(
          "Cable section area must be greater than zero",
        ),
      );
    }
    const upperCasedTension = tension.toUpperCase();
    if (!TensionLevel.isValid(upperCasedTension)) {
      return left(
        new NotAllowedError(
          `Invalid tension level: ${tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
        ),
      );
    }
    const cableWithSameCode = await this.cablesRepository.findByCode(code);
    if (cableWithSameCode) {
      return left(new AlreadyRegisteredError("Cable code already registered"));
    }

    const cable = Cable.create({
      code,
      description: description.toUpperCase(),
      unit: unit.toUpperCase(),
      tension: TensionLevel.create(upperCasedTension),
      sectionAreaInMM,
    });
    await this.cablesRepository.createMany([cable]);
    return right({
      cable,
    });
  }
}
