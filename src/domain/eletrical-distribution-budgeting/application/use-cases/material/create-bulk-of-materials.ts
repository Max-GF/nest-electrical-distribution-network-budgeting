import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { MaterialsRepository } from "../../repositories/materials-repository";
import { CreateMaterialUseCaseRequest } from "./create-material";

export interface FailedLog {
  error: AlreadyRegisteredError | NotAllowedError;
  material: CreateMaterialUseCaseRequest;
}

type CreateBulkOfMaterialsUseCaseResponse = Either<
  never,
  {
    failed: FailedLog[];
    created: Material[];
  }
>;

@Injectable()
export class CreateBulkOfMaterialsUseCase {
  constructor(private materialsRepository: MaterialsRepository) {}

  async execute(
    materialsToCreate: CreateMaterialUseCaseRequest[],
  ): Promise<CreateBulkOfMaterialsUseCaseResponse> {
    if (materialsToCreate.length === 0) {
      return right({ failed: [], created: [] });
    }
    const failed: FailedLog[] = [];
    const created: Material[] = [];
    const actualCodesInRepository = new Set(
      await this.materialsRepository.findAllCodes(),
    );

    for (const materialToCreate of materialsToCreate) {
      const { code, description, unit, tension } = materialToCreate;
      if (actualCodesInRepository.has(code)) {
        failed.push({
          error: new AlreadyRegisteredError("Material code already registered"),
          material: materialToCreate,
        });
        continue;
      }
      const upperCasedTension = tension.toUpperCase();
      if (!TensionLevel.isValid(upperCasedTension)) {
        failed.push({
          error: new NotAllowedError(
            `Invalid tension level: ${tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
          ),
          material: materialToCreate,
        });
        continue;
      }
      const material = Material.create({
        code,
        description: description.toUpperCase(),
        unit: unit.toUpperCase(),
        tension: TensionLevel.create(upperCasedTension),
      });
      created.push(material);
      actualCodesInRepository.add(code);
    }
    if (created.length === 0) {
      return right({ failed, created: [] });
    }
    await this.materialsRepository.createMany(created);
    return right({
      failed,
      created,
    });
  }
}
