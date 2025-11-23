import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItemWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/group-item-with-details";
import {
  TensionLevel,
  TensionLevelEntries,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { GroupsRepository } from "../../repositories/groups-repository";

export interface FetchGroupWithItemsUseCaseRequest {
  name?: string;
  tension?: string;
  description?: string;
  page?: number;
  pageSize?: number;
}

export interface GroupWithDetailedItems {
  group: Group;
  itemsWithDetails: GroupItemWithDetails[];
}

export type FetchGroupWithItemsUseCaseResponse = Either<
  NotAllowedError,
  {
    groupWithDetailedItems: GroupWithDetailedItems[];
    pagination: PaginationResponseParams;
  }
>;

@Injectable()
export class FetchGroupUseCase {
  constructor(private groupsRepository: GroupsRepository) {}

  async execute({
    name,
    tension,
    description,
    page,
    pageSize,
  }: FetchGroupWithItemsUseCaseRequest): Promise<FetchGroupWithItemsUseCaseResponse> {
    const upperCasedTension = tension?.toUpperCase();
    if (upperCasedTension && !TensionLevel.isValid(upperCasedTension)) {
      return left(
        new NotAllowedError(`Tension level "${tension}" is not allowed.`),
      );
    }
    if (page !== undefined && page <= 0) {
      return left(new NotAllowedError("Page must be greater than 0."));
    }
    if (pageSize !== undefined && pageSize <= 0) {
      return left(new NotAllowedError("Page size must be greater than 0."));
    }

    const { groupWithDetailedItems, pagination } =
      await this.groupsRepository.fetchGroupWithDetailedItems(
        {
          name,
          description,
          tension: upperCasedTension as TensionLevelEntries | undefined,
        },
        { page: page || 1, pageSize: pageSize || 20 },
      );

    return right({
      groupWithDetailedItems,
      pagination,
    });
  }
}
