import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { MaterialsRepository } from "../../repositories/materials-repository";

interface EditMaterialUseCaseRequest {
  materialId: string;
  description?: string;
  unit?: string;
  tension?: string;
}

type EditMaterialUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    material: Material;
  }
>;

@Injectable()
export class EditMaterialUseCase {
  constructor(private materialsRepository: MaterialsRepository) {}

  async execute(
    editMaterialUseCaseRequest: EditMaterialUseCaseRequest,
  ): Promise<EditMaterialUseCaseResponse> {
    let hasToEdit = false;

    if (this.noEntries(editMaterialUseCaseRequest)) {
      return left(new NotAllowedError("No entries provided"));
    }

    const { materialId, description, unit, tension } =
      editMaterialUseCaseRequest;

    const upperCasedTension = tension?.toLocaleUpperCase();

    const materialToEdit = await this.materialsRepository.findById(materialId);

    if (!materialToEdit) {
      return left(new ResourceNotFoundError("Given material was not found"));
    }

    if (
      description &&
      description.toUpperCase() !== materialToEdit.description
    ) {
      materialToEdit.description = description.toUpperCase();
      hasToEdit = true;
    }
    if (unit && unit.toUpperCase() !== materialToEdit.unit) {
      materialToEdit.unit = unit.toUpperCase();
      hasToEdit = true;
    }
    if (
      upperCasedTension &&
      upperCasedTension !== materialToEdit.tension.value
    ) {
      if (!TensionLevel.isValid(upperCasedTension)) {
        return left(
          new NotAllowedError(
            `Invalid tension level: ${tension}. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
          ),
        );
      }
      materialToEdit.tension = TensionLevel.create(upperCasedTension);
      hasToEdit = true;
    }

    if (hasToEdit) {
      await this.materialsRepository.save(materialToEdit);
    }
    return right({
      material: materialToEdit,
    });
  }

  noEntries(editMaterialUseCaseRequest: EditMaterialUseCaseRequest): boolean {
    return Object.entries(editMaterialUseCaseRequest)
      .filter(([key]) => key !== "materialId")
      .every(([, value]) => value === undefined);
  }
}
