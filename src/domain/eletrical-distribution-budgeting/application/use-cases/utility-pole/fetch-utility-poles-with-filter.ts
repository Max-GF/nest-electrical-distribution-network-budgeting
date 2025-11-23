import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { UtilityPolesRepository } from "../../repositories/utility-poles-repository";

interface FetchWithFilterUtilityPoleUseCaseRequest {
  codes?: number[];
  description?: string;

  minimumCountForMediumVoltageLevels?: number;

  minimumCountForLowVoltageLevels?: number;

  page?: number;
  pageSize?: number;
}

type FetchWithFilterUtilityPoleUseCaseResponse = Either<
  never,
  {
    utilityPoles: UtilityPole[];
    pagination: PaginationResponseParams;
  }
>;

@Injectable()
export class FetchWithFilterUtilityPoleUseCase {
  constructor(private utilityPolesRepository: UtilityPolesRepository) {}

  async execute({
    codes,
    description,
    minimumCountForLowVoltageLevels,
    minimumCountForMediumVoltageLevels,
    page,
    pageSize,
  }: FetchWithFilterUtilityPoleUseCaseRequest): Promise<FetchWithFilterUtilityPoleUseCaseResponse> {
    const { utilityPoles, pagination } =
      await this.utilityPolesRepository.fetchWithFilter(
        {
          codes,
          description: description?.toUpperCase(),
          minimumCountForLowVoltageLevels,
          minimumCountForMediumVoltageLevels,
        },
        {
          page: page ?? 1,
          pageSize: pageSize ?? 40,
        },
      );
    return right({
      utilityPoles,
      pagination,
    });
  }
}
