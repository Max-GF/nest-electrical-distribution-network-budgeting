import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { Company } from "../../../enterprise/entities/company";
import { Cnpj } from "../../../enterprise/entities/value-objects/cnpj";
import { CompaniesRepository } from "../../repositories/companies-repository";

interface CreateCompanyUseCaseRequest {
  name: string;
  cnpj: string;
}

type CreateCompanyUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError,
  {
    company: Company;
  }
>;

@Injectable()
export class CreateCompanyUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    name,
    cnpj,
  }: CreateCompanyUseCaseRequest): Promise<CreateCompanyUseCaseResponse> {
    if (!Cnpj.isValid(cnpj)) {
      return left(new NotAllowedError("Invalid CNPJ"));
    }

    const companyWithSameCnpj = await this.companiesRepository.findByCnpj(
      Cnpj.normalize(cnpj),
    );
    if (companyWithSameCnpj) {
      return left(new AlreadyRegisteredError("CNPJ already registered"));
    }
    const companyWithSameName = await this.companiesRepository.findByName(name);
    if (companyWithSameName) {
      return left(
        new AlreadyRegisteredError("Company name already registered"),
      );
    }
    const company = Company.create({
      name,
      cnpj: Cnpj.create(cnpj),
    });
    await this.companiesRepository.createMany([company]);

    return right({
      company,
    });
  }
}
