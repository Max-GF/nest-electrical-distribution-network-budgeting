import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { Base } from "../../../enterprise/entities/base";
import { BasesRepository } from "../../repositories/bases-repository";
import { CompaniesRepository } from "../../repositories/companies-repository";

interface CreateBaseUseCaseRequest {
  name: string;
  companyId: string;
}

type CreateBaseUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError,
  {
    base: Base;
  }
>;

@Injectable()
export class CreateBaseUseCase {
  constructor(
    private companiesRepository: CompaniesRepository,
    private basesRepository: BasesRepository,
  ) {}

  async execute({
    name,
    companyId,
  }: CreateBaseUseCaseRequest): Promise<CreateBaseUseCaseResponse> {
    const company = await this.companiesRepository.findById(companyId);
    if (!company) {
      return left(new ResourceNotFoundError("Company not found"));
    }
    const baseWithSameName = await this.basesRepository.findByName(
      name,
      companyId,
    );
    if (baseWithSameName) {
      return left(new AlreadyRegisteredError("Base name already registered"));
    }
    const base = Base.create({
      name,
      companyId: company.id,
    });
    await this.basesRepository.createMany([base]);
    return right({
      base,
    });
  }
}
