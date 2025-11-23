import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { MaterialsRepository } from "../../repositories/materials-repository";

export interface CreateMaterialUseCaseRequest {
  code: number;
  description: string;
  unit: string;
  tension: string;
}

type CreateMaterialUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError,
  {
    material: Material;
  }
>;

@Injectable()
export class CreateMaterialUseCase {
  constructor(private materialsRepository: MaterialsRepository) {}

  async execute({
    code,
    description,
    unit,
    tension,
  }: CreateMaterialUseCaseRequest): Promise<CreateMaterialUseCaseResponse> {
    const upperCasedTension = tension.toUpperCase();
    if (!TensionLevel.isValid(upperCasedTension)) {
      return left(
        new NotAllowedError(
          `Invalid tension level: ${tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
        ),
      );
    }

    const materialWithSameCode =
      await this.materialsRepository.findByCode(code);
    if (materialWithSameCode) {
      return left(
        new AlreadyRegisteredError("Material code already registered"),
      );
    }

    const material = Material.create({
      code,
      description: description.toUpperCase(),
      unit: unit.toUpperCase(),
      tension: TensionLevel.create(upperCasedTension),
    });
    await this.materialsRepository.createMany([material]);
    return right({
      material,
    });
  }
}
