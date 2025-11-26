import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { CablesRepository } from "../../repositories/cables-repository";

interface FetchCablesWithFilterOptionsUseCaseRequest {
  codes?: number[];
  description?: string;

  tension?: string;
  maxSectionAreaInMM?: number;
  minSectionAreaInMM?: number;

  page?: number;
  pageSize?: number;
}

type FetchCablesWithFilterOptionsUseCaseResponse = Either<
  NotAllowedError,
  {
    cables: Cable[];
    pagination: PaginationResponseParams;
  }
>;

@Injectable()
export class FetchCablesWithFilterOptionsUseCase {
  constructor(private cablesRepository: CablesRepository) {}

  async execute({
    codes,
    description,
    tension,
    maxSectionAreaInMM,
    minSectionAreaInMM,
    page,
    pageSize,
  }: FetchCablesWithFilterOptionsUseCaseRequest): Promise<FetchCablesWithFilterOptionsUseCaseResponse> {
    const upperCasedTension = tension ? tension.toUpperCase() : undefined;
    if (
      upperCasedTension !== undefined &&
      !TensionLevel.isValid(upperCasedTension)
    ) {
      return left(
        new NotAllowedError(
          `Invalid tension level: ${tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
        ),
      );
    }
    const { cables, pagination } = await this.cablesRepository.fetchWithFilter(
      {
        codes,
        description: description?.toUpperCase(),
        tension: upperCasedTension,
        maxSectionAreaInMM,
        minSectionAreaInMM,
      },
      {
        page: page ?? 1,
        pageSize: pageSize ?? 40,
      },
    );
    return right({
      cables,
      pagination,
    });
  }
}
