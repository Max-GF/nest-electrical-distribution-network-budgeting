import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { Company } from "../../../enterprise/entities/company";
import { Cnpj } from "../../../enterprise/entities/value-objects/cnpj";
import { CompaniesRepository } from "../../repositories/companies-repository";

interface EditCompanyUseCaseRequest {
  companyId: string;
  actualUserCompanyId: string;
  name?: string;
  cnpj?: string;
}

type EditCompanyUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError | ResourceNotFoundError,
  {
    company: Company;
  }
>;

@Injectable()
export class EditCompanyUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute(
    editCompanyUseCaseBody: Readonly<EditCompanyUseCaseRequest>,
  ): Promise<EditCompanyUseCaseResponse> {
    let hasNewEntries = false;

    const { companyId, name, cnpj, actualUserCompanyId } =
      editCompanyUseCaseBody;
    if (companyId !== actualUserCompanyId) {
      return left(
        new NotAllowedError("You cannot edit a company you don't belong to"),
      );
    }
    if (this.noEntries(editCompanyUseCaseBody)) {
      return left(new NotAllowedError("No entries provided"));
    }

    const companyToEdit = await this.companiesRepository.findById(companyId);

    if (!companyToEdit) {
      return left(new ResourceNotFoundError("Company not found"));
    }

    if (name && name !== companyToEdit.name) {
      const companyWithSameName =
        await this.companiesRepository.findByName(name);
      if (companyWithSameName) {
        return left(
          new AlreadyRegisteredError("Company name already registered"),
        );
      }
      companyToEdit.name = name;
      hasNewEntries = true;
    }
    if (cnpj) {
      const normalizedCnpj = Cnpj.normalize(cnpj);
      if (normalizedCnpj !== companyToEdit.cnpj.value) {
        if (!Cnpj.isValid(cnpj)) {
          return left(new NotAllowedError("Invalid CNPJ"));
        }
        const companyWithSameCnpj =
          await this.companiesRepository.findByCnpj(normalizedCnpj);
        if (companyWithSameCnpj) {
          return left(new AlreadyRegisteredError("CNPJ already registered"));
        }
        companyToEdit.cnpj = Cnpj.create(cnpj);
        hasNewEntries = true;
      }
    }

    if (hasNewEntries) {
      await this.companiesRepository.save(companyToEdit);
    }

    return right({
      company: companyToEdit,
    });
  }
  noEntries(entries: EditCompanyUseCaseRequest): boolean {
    return Object.entries(entries)
      .filter(([key]) => key !== "companyId" && key !== "actualUserCompanyId")
      .every(([, value]) => value === undefined);
  }
}
