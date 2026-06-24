import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";
import { CablesRepository } from "../../repositories/cables-repository";

interface FailedLog {
  error: AlreadyRegisteredError | NotAllowedError | ResourceNotFoundError;
  cableConnector: CreateBulkCableConnectorUseCaseRequest;
}

type CreateBulkOfCableConnectorsUseCaseResponse = Either<
  never,
  {
    failed: FailedLog[];
    created: CableConnector[];
  }
>;

export interface CreateBulkCableConnectorUseCaseRequest {
  code: number;
  description: string;
  unit: string;

  entranceCablesOptionsCodes: number[];
  exitCablesOptionsCodes?: number[];
}

@Injectable()
export class CreateBulkOfCableConnectorsUseCase {
  constructor(
    private cableConnectorsRepository: CableConnectorsRepository,
    private cablesRepository: CablesRepository,
  ) {}

  async execute(
    cableConnectorsToCreate: CreateBulkCableConnectorUseCaseRequest[],
  ): Promise<CreateBulkOfCableConnectorsUseCaseResponse> {
    if (cableConnectorsToCreate.length === 0) {
      return right({ failed: [], created: [] });
    }

    const failed: FailedLog[] = [];
    const created: CableConnector[] = [];

    const cablesCodesToSearch = new Set<number>(
      cableConnectorsToCreate.flatMap((c) => [
        ...c.entranceCablesOptionsCodes,
        ...(c.exitCablesOptionsCodes || []),
      ]),
    );

    const cables = await this.cablesRepository.findByCodes(
      Array.from(cablesCodesToSearch),
    );

    const cableIdByCode = new Map<number, string>();
    cables.forEach((c) => cableIdByCode.set(c.code, c.id.toString()));

    // 2. Busca de Conectores Existentes
    const cableConnectorsCodesToSearch = new Set<number>(
      cableConnectorsToCreate.map((c) => c.code),
    );
    const cableConnectorsFound =
      await this.cableConnectorsRepository.findByCodes(
        Array.from(cableConnectorsCodesToSearch),
      );
    const cableConnectorsCodesFound = new Set(
      cableConnectorsFound.map((c) => c.code),
    );

    const processedCodesInThisBatch = new Set<number>();

    for (const cableConnectorToCreate of cableConnectorsToCreate) {
      if (cableConnectorToCreate.code <= 0) {
        failed.push({
          error: new NotAllowedError(
            "Cable Connector code must be greater than zero",
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }

      if (
        cableConnectorsCodesFound.has(cableConnectorToCreate.code) ||
        processedCodesInThisBatch.has(cableConnectorToCreate.code)
      ) {
        failed.push({
          error: new AlreadyRegisteredError(
            `Cable Connector with code ${cableConnectorToCreate.code} already registered or duplicated in payload`,
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }

      if (cableConnectorToCreate.entranceCablesOptionsCodes.length === 0) {
        failed.push({
          error: new NotAllowedError(
            "Cable Connector must have at least one entrance cable option",
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }

      const missingCablesCodes = [
        ...cableConnectorToCreate.entranceCablesOptionsCodes,
        ...(cableConnectorToCreate.exitCablesOptionsCodes || []),
      ].filter((code) => !cableIdByCode.has(code));

      if (missingCablesCodes.length > 0) {
        failed.push({
          error: new ResourceNotFoundError(
            `Some cables are not registered: ${missingCablesCodes.join(", ")}`,
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }

      processedCodesInThisBatch.add(cableConnectorToCreate.code);

      const cableConnector = CableConnector.create({
        code: cableConnectorToCreate.code,
        description: cableConnectorToCreate.description.toUpperCase(),
        unit: cableConnectorToCreate.unit.toUpperCase(),
        entranceCablesOptionsIds:
          cableConnectorToCreate.entranceCablesOptionsCodes.map(
            (code) => new UniqueEntityID(cableIdByCode.get(code) as string),
          ),
        exitCablesOptionsIds:
          cableConnectorToCreate.exitCablesOptionsCodes?.map(
            (code) => new UniqueEntityID(cableIdByCode.get(code) as string),
          ) || [],
      });

      created.push(cableConnector);
    }

    if (created.length > 0) {
      await this.cableConnectorsRepository.createMany(created);
    }

    return right({
      failed,
      created,
    });
  }
}
