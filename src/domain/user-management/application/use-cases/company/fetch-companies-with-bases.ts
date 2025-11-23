import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { CompanyWithBases } from "../../../enterprise/entities/value-objects/company-with-bases";
import { CompaniesRepository } from "../../repositories/companies-repository";

type FetchCompaniesWithBasesUseCaseResponse = Either<
  null,
  {
    companies: CompanyWithBases[];
  }
>;

@Injectable()
export class FetchCompaniesWithBasesUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute(): Promise<FetchCompaniesWithBasesUseCaseResponse> {
    const companies = await this.companiesRepository.findAllWithBases();

    return right({
      companies,
    });
  }
}
