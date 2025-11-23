import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { Company } from "../../../enterprise/entities/company";
import { CompaniesRepository } from "../../repositories/companies-repository";

type FetchCompaniesUseCaseResponse = Either<
  null,
  {
    companies: Company[];
  }
>;

@Injectable()
export class FetchCompaniesUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute(): Promise<FetchCompaniesUseCaseResponse> {
    const companies = await this.companiesRepository.findAll();

    return right({
      companies,
    });
  }
}
