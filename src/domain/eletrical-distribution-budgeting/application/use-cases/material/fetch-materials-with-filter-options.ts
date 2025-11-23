import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { MaterialsRepository } from "../../repositories/materials-repository";

interface FetchWithFilterMaterialsUseCaseRequest {
  codes?: number[];
  description?: string;
  tension?: string;

  page?: number;
  pageSize?: number;
}

type FetchWithFilterMaterialsUseCaseResponse = Either<
  NotAllowedError,
  {
    materials: Material[];
    pagination: PaginationResponseParams;
  }
>;

@Injectable()
export class FetchWithFilterMaterialsUseCase {
  constructor(private materialsRepository: MaterialsRepository) {}

  async execute({
    codes,
    description,
    tension,
    page,
    pageSize,
  }: FetchWithFilterMaterialsUseCaseRequest): Promise<FetchWithFilterMaterialsUseCaseResponse> {
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
    const { materials, pagination } =
      await this.materialsRepository.fetchWithFilter(
        {
          codes,
          description: description?.toUpperCase(),
          tension: upperCasedTension,
        },
        {
          page: page ?? 1,
          pageSize: pageSize ?? 40,
        },
      );
    return right({
      materials,
      pagination,
    });
  }
}
