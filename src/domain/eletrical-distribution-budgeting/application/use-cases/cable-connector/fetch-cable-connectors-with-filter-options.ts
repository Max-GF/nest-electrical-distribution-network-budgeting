import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";

interface FetchWithFilterCableConnectorUseCaseRequest {
  codes?: number[];
  description?: string;

  entranceMinValueMM?: number;
  entranceMaxValueMM?: number;

  exitMinValueMM?: number;
  exitMaxValueMM?: number;

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
    fetchCableConnectorsFilterOptions: FetchWithFilterCableConnectorUseCaseRequest,
  ): Promise<FetchWithFilterCableConnectorUseCaseResponse> {
    if (this.oneLengthInfoIsLessThanZero(fetchCableConnectorsFilterOptions)) {
      return left(
        new NotAllowedError(
          "Entrance and exit values must be greater than or equal to zero.",
        ),
      );
    }
    const {
      codes,
      description,
      entranceMinValueMM,
      entranceMaxValueMM,
      exitMinValueMM,
      exitMaxValueMM,
      page,
      pageSize,
    } = fetchCableConnectorsFilterOptions;
    const { cableConnectors, pagination } =
      await this.cableConnectorsRepository.fetchWithFilter(
        {
          codes,
          description: description?.toUpperCase(),
          entranceMinValueMM,
          entranceMaxValueMM,
          exitMinValueMM,
          exitMaxValueMM,
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
  oneLengthInfoIsLessThanZero(
    fetchCableConnectorsFilterOptions: FetchWithFilterCableConnectorUseCaseRequest,
  ): boolean {
    return Object.entries(fetchCableConnectorsFilterOptions)
      .filter(
        ([key]) => !["page", "pageSize", "codes", "description"].includes(key),
      )
      .some(([, value]) => value < 0);
  }
}
