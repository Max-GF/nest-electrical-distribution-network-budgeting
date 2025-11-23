import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";
import { CreateCableConnectorUseCaseRequest } from "./create-cable-connector";

interface FailedLog {
  error: AlreadyRegisteredError | NegativeCableSectionError | NotAllowedError;
  cableConnector: CreateCableConnectorUseCaseRequest;
}

type CreateBulkOfCableConnectorsUseCaseResponse = Either<
  never,
  {
    failed: FailedLog[];
    created: CableConnector[];
  }
>;

@Injectable()
export class CreateBulkOfCableConnectorsUseCase {
  constructor(private cableConnectorsRepository: CableConnectorsRepository) {}

  async execute(
    cableConnectorsToCreate: CreateCableConnectorUseCaseRequest[],
  ): Promise<CreateBulkOfCableConnectorsUseCaseResponse> {
    if (cableConnectorsToCreate.length === 0) {
      return right({ failed: [], created: [] });
    }
    const failed: FailedLog[] = [];
    const created: CableConnector[] = [];
    const actualCodesInRepository = new Set(
      await this.cableConnectorsRepository.findAllCodes(),
    );

    for (const cableConnectorToCreate of cableConnectorsToCreate) {
      if (this.oneLengthInfoIsLessThanZero(cableConnectorToCreate)) {
        failed.push({
          error: new NegativeCableSectionError(
            "Cable Connector conections area must be greater than zero",
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }
      if (
        cableConnectorToCreate.entranceMinValueMM >
        cableConnectorToCreate.entranceMaxValueMM
      ) {
        failed.push({
          error: new NotAllowedError(
            "Entrace maximum value must be greater than entrance minimum value",
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }
      if (
        cableConnectorToCreate.exitMinValueMM >
        cableConnectorToCreate.exitMaxValueMM
      ) {
        failed.push({
          error: new NotAllowedError(
            "Exit maximum value must be greater than exit minimum value",
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }
      const { code, description, unit, ...othersProps } =
        cableConnectorToCreate;
      if (actualCodesInRepository.has(code)) {
        failed.push({
          error: new AlreadyRegisteredError(
            "Cable Connector code already registered",
          ),
          cableConnector: cableConnectorToCreate,
        });
        continue;
      }
      const cableConnector = CableConnector.create({
        code,
        description: description.toUpperCase(),
        unit: unit.toUpperCase(),
        ...othersProps,
      });
      created.push(cableConnector);
      actualCodesInRepository.add(code);
    }
    if (created.length === 0) {
      return right({ failed, created: [] });
    }
    await this.cableConnectorsRepository.createMany(created);
    return right({
      failed,
      created,
    });
  }
  oneLengthInfoIsLessThanZero(
    cableConnectorToCreate: CreateCableConnectorUseCaseRequest,
  ): boolean {
    return Object.entries(cableConnectorToCreate)
      .filter(
        ([key]) => key !== "code" && key !== "description" && key !== "unit",
      )
      .some(([, value]) => value < 0);
  }
}
