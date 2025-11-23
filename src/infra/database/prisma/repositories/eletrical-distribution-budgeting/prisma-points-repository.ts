import { Injectable } from "@nestjs/common";
import { PointsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/points-repository";
import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { PointWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/point-with-details";
import { PrismaPointMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-point-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaPointsRepository implements PointsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(points: Point[]): Promise<void> {
    await this.prisma.point.createMany({
      data: points.map(PrismaPointMapper.toPrisma),
    });
  }

  async save(point: Point): Promise<void> {
    const data = PrismaPointMapper.toPrisma(point);
    await this.prisma.point.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<Point | null> {
    const point = await this.prisma.point.findUnique({
      where: { id },
    });

    if (!point) {
      return null;
    }

    return PrismaPointMapper.toDomain(point);
  }

  async findByNameAndProjectId(
    name: string,
    projectId: string,
  ): Promise<Point | null> {
    const point = await this.prisma.point.findFirst({
      where: {
        name,
        projectId,
      },
    });

    if (!point) {
      return null;
    }

    return PrismaPointMapper.toDomain(point);
  }

  async findAllByProjectId(projectId: string): Promise<Point[]> {
    const points = await this.prisma.point.findMany({
      where: { projectId },
    });

    return points.map(PrismaPointMapper.toDomain);
  }

  async findByProjectIdAndNames(
    projectId: string,
    names: string[],
  ): Promise<Point[]> {
    const points = await this.prisma.point.findMany({
      where: {
        projectId,
        name: {
          in: names,
        },
      },
    });

    return points.map(PrismaPointMapper.toDomain);
  }

  async findAllWithDetailsByProjectId(
    projectId: string,
  ): Promise<PointWithDetails[]> {
    const points = await this.prisma.point.findMany({
      where: { projectId },
      include: {
        project: true,
        mediumTensionEntranceCable: true,
        mediumTensionExitCable: true,
        lowTensionEntranceCable: true,
        lowTensionExitCable: true,
        utilityPole: true,
      },
    });

    return points.map((pointRaw) => {
      return PrismaPointMapper.toDomainWithDetails(pointRaw);
    });
  }
}
