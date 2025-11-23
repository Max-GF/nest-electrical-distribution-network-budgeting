import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { Base } from "../../../enterprise/entities/base";
import { BasesRepository } from "../../repositories/bases-repository";

interface FetchBasesByCompanyIdUseCaseRequest {
  companyId: string;
}

type FetchBasesByCompanyIdUseCaseResponse = Either<
  null,
  {
    bases: Base[];
  }
>;

@Injectable()
export class FetchBasesByCompanyIdUseCase {
  constructor(private basesRepository: BasesRepository) {}

  async execute({
    companyId,
  }: FetchBasesByCompanyIdUseCaseRequest): Promise<FetchBasesByCompanyIdUseCaseResponse> {
    const bases = await this.basesRepository.fetchByCompanyId(companyId);

    return right({
      bases,
    });
  }
}
