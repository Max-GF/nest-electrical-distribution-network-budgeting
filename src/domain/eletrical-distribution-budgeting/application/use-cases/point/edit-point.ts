import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { CablesRepository } from "../../repositories/cables-repository";
import { PointsRepository } from "../../repositories/points-repository";
import { UtilityPolesRepository } from "../../repositories/utility-poles-repository";

export interface EditPointUseCaseRequest {
  pointId: string;
  description?: string;
  mediumTensionEntranceCableId?: string;
  mediumTensionExitCableId?: string;
  lowTensionEntranceCableId?: string;
  lowTensionExitCableId?: string;
  utilityPoleId?: string;
}

type EditPointUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError,
  {
    point: Point;
  }
>;

@Injectable()
export class EditPointUseCase {
  constructor(
    private pointsRepository: PointsRepository,
    private utilityPolesRepository: UtilityPolesRepository,
    private cablesRepository: CablesRepository,
  ) {}

  async execute(
    editPointUseCaseRequest: EditPointUseCaseRequest,
  ): Promise<EditPointUseCaseResponse> {
    let hasToEdit = false;
    if (this.noEntries(editPointUseCaseRequest)) {
      return left(
        new NotAllowedError("At least one field must be provided to edit"),
      );
    }
    const {
      pointId,
      description,
      lowTensionEntranceCableId,
      lowTensionExitCableId,
      mediumTensionEntranceCableId,
      mediumTensionExitCableId,
      utilityPoleId,
    } = editPointUseCaseRequest;

    const point = await this.pointsRepository.findById(pointId);
    if (!point) {
      return left(new ResourceNotFoundError("Point does not exist"));
    }
    if (utilityPoleId && utilityPoleId !== point.utilityPoleId?.toString()) {
      const utilityPole =
        await this.utilityPolesRepository.findById(utilityPoleId);
      if (!utilityPole) {
        return left(
          new ResourceNotFoundError("Given utility pole does not exist"),
        );
      }
      point.utilityPoleId = new UniqueEntityID(utilityPoleId);
      hasToEdit = true;
    }
    const cablesIds = [
      lowTensionEntranceCableId,
      lowTensionExitCableId,
      mediumTensionEntranceCableId,
      mediumTensionExitCableId,
    ].filter((id) => id !== undefined);

    if (cablesIds.length > 0) {
      const cablesExistenceChecks =
        await this.cablesRepository.findByIds(cablesIds);

      if (cablesExistenceChecks.length !== cablesIds.length) {
        const setOfCableExistingIds = new Set(
          cablesExistenceChecks.map((cable) => cable.id.toString()),
        );
        const missingCableIds = cablesIds.filter(
          (id) => !setOfCableExistingIds.has(id),
        );
        return left(
          new ResourceNotFoundError(
            `Cables not found: ${missingCableIds.join(", ")}`,
          ),
        );
      }
    }
    if (
      lowTensionEntranceCableId &&
      lowTensionEntranceCableId !== point.lowTensionEntranceCableId?.toString()
    ) {
      point.lowTensionEntranceCableId = new UniqueEntityID(
        lowTensionEntranceCableId,
      );
      hasToEdit = true;
    }
    if (
      lowTensionExitCableId &&
      lowTensionExitCableId !== point.lowTensionExitCableId?.toString()
    ) {
      point.lowTensionExitCableId = new UniqueEntityID(lowTensionExitCableId);
      hasToEdit = true;
    }
    if (
      mediumTensionEntranceCableId &&
      mediumTensionEntranceCableId !==
        point.mediumTensionEntranceCableId?.toString()
    ) {
      point.mediumTensionEntranceCableId = new UniqueEntityID(
        mediumTensionEntranceCableId,
      );
      hasToEdit = true;
    }
    if (
      mediumTensionExitCableId &&
      mediumTensionExitCableId !== point.mediumTensionExitCableId?.toString()
    ) {
      point.mediumTensionExitCableId = new UniqueEntityID(
        mediumTensionExitCableId,
      );
      hasToEdit = true;
    }

    if (description && description !== point.description) {
      point.description = description;
      hasToEdit = true;
    }
    if (!hasToEdit) {
      return left(
        new NotAllowedError("At least one field must be different to edit"),
      );
    }
    await this.pointsRepository.save(point);
    return right({
      point,
    });
  }

  noEntries(editPointUseCaseRequest: EditPointUseCaseRequest): boolean {
    return Object.entries(editPointUseCaseRequest).every(
      ([key, value]) => value === undefined || key === "pointId",
    );
  }
}
