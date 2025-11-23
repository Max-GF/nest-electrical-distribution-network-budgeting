import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchProjectsFilterOptions,
  ProjectsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/projects-repository";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { PrismaProjectMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-project-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaProjectsRepository implements ProjectsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(projects: Project[]): Promise<void> {
    await this.prisma.project.createMany({
      data: projects.map(PrismaProjectMapper.toPrisma),
    });
  }

  async save(project: Project): Promise<void> {
    const data = PrismaProjectMapper.toPrisma(project);
    await this.prisma.project.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return null;
    }

    return PrismaProjectMapper.toDomain(project);
  }

  async findByIds(ids: string[]): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return projects.map(PrismaProjectMapper.toDomain);
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: { name },
    });

    if (!project) {
      return null;
    }

    return PrismaProjectMapper.toDomain(project);
  }

  async fetchWithFilterOptions(
    filter: FetchProjectsFilterOptions,
    pagination: PaginationParams,
  ): Promise<{ projects: Project[]; pagination: PaginationResponseParams }> {
    const where: Prisma.ProjectWhereInput = {};

    if (filter.name) {
      where.name = { contains: filter.name, mode: "insensitive" };
    }

    if (filter.description) {
      where.description = {
        contains: filter.description,
        mode: "insensitive",
      };
    }

    if (filter.budgetAlreadyCalculated !== undefined) {
      where.budgetAlreadyCalculated = filter.budgetAlreadyCalculated;
    }

    if (filter.calculatedDateOptions) {
      const dateFilter: Prisma.DateTimeNullableFilter = {};

      if (filter.calculatedDateOptions.before) {
        dateFilter.lte = filter.calculatedDateOptions.before;
      }
      if (filter.calculatedDateOptions.after) {
        dateFilter.gte = filter.calculatedDateOptions.after;
      }

      if (Object.keys(dateFilter).length > 0) {
        where.lastBudgetCalculatedAt = dateFilter;
      }
    }

    const [count, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
      }),
    ]);

    return {
      projects: projects.map(PrismaProjectMapper.toDomain),
      pagination: {
        actualPage: pagination.page,
        actualPageSize: projects.length,
        lastPage: Math.ceil(count / pagination.pageSize),
      },
    };
  }
}
