import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { Base } from "src/domain/user-management/enterprise/entities/base";
import { BasesRepository } from "../../repositories/bases-repository";

interface EditBaseUseCaseRequest {
  baseId: string;
  actualUserCompanyId: string;
  name: string;
}

type EditBaseUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError | ResourceNotFoundError,
  {
    base: Base;
  }
>;

@Injectable()
export class EditBaseUseCase {
  constructor(private basesRepository: BasesRepository) {}

  async execute({
    baseId,
    actualUserCompanyId,
    name,
  }: Readonly<EditBaseUseCaseRequest>): Promise<EditBaseUseCaseResponse> {
    const baseToEdit = await this.basesRepository.findById(baseId);
    if (!baseToEdit) {
      return left(new ResourceNotFoundError("Base not found."));
    }
    if (baseToEdit.companyId.toString() !== actualUserCompanyId) {
      return left(
        new NotAllowedError(
          "You are not allowed to edit a base from another company.",
        ),
      );
    }
    if (name === baseToEdit.name) {
      return right({
        base: baseToEdit,
      });
    }
    const baseWithSameName = await this.basesRepository.findByName(
      name,
      actualUserCompanyId,
    );
    if (baseWithSameName) {
      return left(
        new AlreadyRegisteredError("Base with this name already exists."),
      );
    }
    baseToEdit.name = name;
    await this.basesRepository.save(baseToEdit);

    return right({
      base: baseToEdit,
    });
  }
}
