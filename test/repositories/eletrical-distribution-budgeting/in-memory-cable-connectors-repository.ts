import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  CableConnectorsRepository,
  FetchCableConnectorsFilterOptions,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";

export class InMemoryCableConnectorsRepository
  implements CableConnectorsRepository
{
  public items: CableConnector[] = [];
  async createMany(cableConnectors: CableConnector[]): Promise<void> {
    this.items.push(...cableConnectors);
  }
  async save(cableConnector: CableConnector): Promise<void> {
    const cableConnectorToSaveIndex = this.items.findIndex(
      (item) => cableConnector.id.toString() === item.id.toString(),
    );
    if (cableConnectorToSaveIndex >= 0) {
      this.items[cableConnectorToSaveIndex] = cableConnector;
    }
  }
  async findById(id: string): Promise<CableConnector | null> {
    const foundedCableConnector = this.items.find(
      (item) => item.id.toString() === id,
    );
    return foundedCableConnector ?? null;
  }
  async findByCode(code: number): Promise<CableConnector | null> {
    const foundedCableConnector = this.items.find((item) => item.code === code);
    return foundedCableConnector ?? null;
  }
  async fetchWithFilter(
    filterOptions: FetchCableConnectorsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    cableConnectors: CableConnector[];
    pagination: PaginationResponseParams;
  }> {
    const { page, pageSize } = paginationParams;
    const { codes, description } = filterOptions;

    const filteredCableConnectors = this.items.filter((item) => {
      if (codes && !codes.includes(item.code)) {
        return false;
      }
      if (description && !item.description.includes(description)) {
        return false;
      }
      return true;
    });

    const handedData = filteredCableConnectors
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);
    return {
      cableConnectors: handedData,
      pagination: {
        actualPage: page,
        actualPageSize: pageSize,
        lastPage: Math.ceil(filteredCableConnectors.length / pageSize),
      },
    };
  }

  async findByCodes(codes: number[]): Promise<CableConnector[]> {
    const foundedCableConnectors = this.items.filter((item) =>
      codes.includes(item.code),
    );
    return foundedCableConnectors;
  }
}
