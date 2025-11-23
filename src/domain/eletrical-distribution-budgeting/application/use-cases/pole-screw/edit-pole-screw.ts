import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { PoleScrewsRepository } from "../../repositories/pole-screws-repository";

interface EditPoleScrewUseCaseRequest {
  poleScrewId: string;
  description?: string;
  unit?: string;

  lengthInMM?: number;
}

type EditPoleScrewUseCaseResponse = Either<
  | AlreadyRegisteredError
  | ResourceNotFoundError
  | NotAllowedError
  | NegativeScrewLengthError,
  {
    poleScrew: PoleScrew;
  }
>;

@Injectable()
export class EditPoleScrewUseCase {
  constructor(private poleScrewsRepository: PoleScrewsRepository) {}

  async execute(
    editPoleScrewUseCaseRequest: EditPoleScrewUseCaseRequest,
  ): Promise<EditPoleScrewUseCaseResponse> {
    let hasToEdit = false;

    if (this.noEntries(editPoleScrewUseCaseRequest)) {
      return left(new NotAllowedError("No entries provided"));
    }

    const { poleScrewId, description, lengthInMM, unit } =
      editPoleScrewUseCaseRequest;

    if (lengthInMM && lengthInMM <= 0) {
      return left(
        new NegativeScrewLengthError("Length must be greater than zero"),
      );
    }

    const poleScrewToEdit =
      await this.poleScrewsRepository.findById(poleScrewId);

    if (!poleScrewToEdit) {
      return left(new ResourceNotFoundError("Given pole screw was not found"));
    }

    if (
      description &&
      description.toUpperCase() !== poleScrewToEdit.description
    ) {
      poleScrewToEdit.description = description.toUpperCase();
      hasToEdit = true;
    }
    if (lengthInMM && lengthInMM !== poleScrewToEdit.lengthInMM) {
      poleScrewToEdit.lengthInMM = lengthInMM;
      hasToEdit = true;
    }
    if (unit && unit.toUpperCase() !== poleScrewToEdit.unit) {
      poleScrewToEdit.unit = unit.toUpperCase();
      hasToEdit = true;
    }

    if (hasToEdit) {
      await this.poleScrewsRepository.save(poleScrewToEdit);
    }
    return right({
      poleScrew: poleScrewToEdit,
    });
  }

  noEntries(editPoleScrewUseCaseRequest: EditPoleScrewUseCaseRequest): boolean {
    return Object.entries(editPoleScrewUseCaseRequest)
      .filter(([key]) => key !== "poleScrewId")
      .every(([, value]) => value === undefined);
  }
}
