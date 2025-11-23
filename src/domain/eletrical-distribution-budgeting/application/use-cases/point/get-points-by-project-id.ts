import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PointWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/point-with-details";
import { PointsRepository } from "../../repositories/points-repository";

export interface GetProjectPointUseCaseRequest {
  projectId: string;
}

export type GetProjectPointUseCaseResponse = Either<
  NotAllowedError,
  {
    points: PointWithDetails[];
  }
>;

@Injectable()
export class GetProjectPointUseCase {
  constructor(private pointsRepository: PointsRepository) {}

  async execute({
    projectId,
  }: GetProjectPointUseCaseRequest): Promise<GetProjectPointUseCaseResponse> {
    const points =
      await this.pointsRepository.findAllWithDetailsByProjectId(projectId);

    return right({
      points,
    });
  }
}
