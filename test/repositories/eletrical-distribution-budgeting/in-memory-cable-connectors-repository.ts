import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  CableConnectorsRepository,
  FetchCableConnectorsFilterOptions,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/cable-connector-with-details";
import { InMemoryCablesRepository } from "./in-memory-cables-repository";

export class InMemoryCableConnectorsRepository
  implements CableConnectorsRepository
{
  constructor(private cablesRepository: InMemoryCablesRepository) {}
  async getAll(): Promise<CableConnector[]> {
    return this.items;
  }
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
    cableConnectors: CableConnectorWithDetails[];
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
    const cables = await this.cablesRepository.findByIds(
      filteredCableConnectors.flatMap((c) => [
        ...c.entranceCablesOptionsIds.map((id) => id.toString()),
        ...(c.exitCablesOptionsIds?.map((id) => id.toString()) ?? []),
      ]),
    );
    const cablesById = new Map<string, Cable>();
    cables.forEach((c) => cablesById.set(c.id.toString(), c));

    const handedData = filteredCableConnectors
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);

    const cableConnectorsWithDetails = handedData.map((cableConnector) => {
      const entranceCablesOptions = cableConnector.entranceCablesOptionsIds
        .map((id) => cablesById.get(id.toString()))
        .filter((cable): cable is Cable => cable !== undefined);
      const exitCablesOptions = cableConnector.exitCablesOptionsIds
        ? cableConnector.exitCablesOptionsIds
            .map((id) => cablesById.get(id.toString()))
            .filter((cable): cable is Cable => cable !== undefined)
        : undefined;

      return CableConnectorWithDetails.create({
        id: cableConnector.id,
        code: cableConnector.code,
        description: cableConnector.description,
        unit: cableConnector.unit,
        entranceCablesOptions,
        exitCablesOptions,
      });
    });
    return {
      cableConnectors: cableConnectorsWithDetails,
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
