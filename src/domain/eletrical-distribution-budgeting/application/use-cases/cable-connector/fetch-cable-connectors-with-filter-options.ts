import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";

interface FetchWithFilterCableConnectorUseCaseRequest {
  codes?: number[];
  description?: string;

  page?: number;
  pageSize?: number;
}

type FetchWithFilterCableConnectorUseCaseResponse = Either<
  NotAllowedError,
  {
    cableConnectors: CableConnector[];
    pagination: PaginationResponseParams;
  }
>;

@Injectable()
export class FetchWithFilterCableConnectorUseCase {
  constructor(private cableConnectorsRepository: CableConnectorsRepository) {}

  async execute(
    request: FetchWithFilterCableConnectorUseCaseRequest,
  ): Promise<FetchWithFilterCableConnectorUseCaseResponse> {
    const { codes, description, page, pageSize } = request;

    if (page !== undefined && page <= 0) {
      return left(new NotAllowedError("Page must be greater than zero"));
    }

    if (pageSize !== undefined && pageSize <= 0) {
      return left(new NotAllowedError("Page size must be greater than zero"));
    }

    const filterCodes = codes?.length ? codes : undefined;
    const filterDescription = description?.trim()
      ? description.trim().toUpperCase()
      : undefined;

    const { cableConnectors, pagination } =
      await this.cableConnectorsRepository.fetchWithFilter(
        {
          codes: filterCodes,
          description: filterDescription,
        },
        {
          page: page ?? 1,
          pageSize: pageSize ?? 40,
        },
      );

    return right({
      cableConnectors,
      pagination,
    });
  }
}
