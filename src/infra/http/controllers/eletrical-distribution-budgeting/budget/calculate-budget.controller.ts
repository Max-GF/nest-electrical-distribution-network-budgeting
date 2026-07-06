import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { CalculateBudgetUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/budget/calculate-budget";
import { ValidateManyPointsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/validate-many-points";
import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { CalculateBudgetPresenter } from "../../../presenters/eletrical-distribution-budgeting/calculate-budget-presenter";
import { ValidateManyPointsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/point/validate-many-points.dto";
import { CalculateBudgetResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/budget/calculate-budget.response";

// Importando os repositórios e o Value Object
import { CableConnectorsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { CablesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { PoleScrewsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/pole-screws-repository";
import { UtilityPolesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { ProjectMaterialWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/project-material-with-details";

const spanRequestSchema = z.object({
  name: z.string(),
  cableId: z.string().uuid(),
  extension: z.number(),
  tensionLevel: z.enum(["LOW", "MEDIUM"]),
});

const cableRequestSchema = z.object({
  isNew: z.boolean(),
  cableId: z.string().uuid(),
});

const lowTensionCablesRequestSchema = z.object({
  entranceCable: cableRequestSchema,
  exitCable: cableRequestSchema.optional(),
});

const mediumTensionCablesRequestSchema = z.object({
  entranceCable: cableRequestSchema,
  exitCable: cableRequestSchema.optional(),
});

const pointCablesRequestSchema = z.object({
  lowTensionCables: lowTensionCablesRequestSchema.optional(),
  mediumTensionCables: mediumTensionCablesRequestSchema.optional(),
});

const pointUtilityPoleRequestSchema = z.object({
  isNew: z.boolean(),
  utilityPoleId: z.string().uuid(),
});

const pointGroupRequestSchema = z.object({
  tensionLevel: z.enum(["LOW", "MEDIUM"]),
  level: z.number(),
  groupId: z.string().uuid(),
  onStrongSideDirection: z.boolean(),
});

const untiedMaterialRequestSchema = z.object({
  quantity: z.number(),
  materialId: z.string().uuid(),
});

const pointToValidateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  pointUtilityPole: pointUtilityPoleRequestSchema,
  pointCables: pointCablesRequestSchema,
  pointGroups: z.array(pointGroupRequestSchema).optional(),
  untiedMaterials: z.array(untiedMaterialRequestSchema).optional(),
});

const calculateBudgetBodySchema = z.object({
  points: z.array(pointToValidateRequestSchema),
  spans: z.array(spanRequestSchema),
});

type CalculateBudgetBodySchema = z.infer<typeof calculateBudgetBodySchema>;

@Controller("/projects/:projectId/budget/calculate")
export class CalculateBudgetController {
  constructor(
    private validateManyPointsUseCase: ValidateManyPointsUseCase,
    private calculateBudgetUseCase: CalculateBudgetUseCase,
    private cablesRepository: CablesRepository,
    private utilityPolesRepository: UtilityPolesRepository,
    private cableConnectorsRepository: CableConnectorsRepository,
    private poleScrewsRepository: PoleScrewsRepository,
    private materialsRepository: MaterialsRepository,
    private groupsRepository: GroupsRepository,
  ) {}

  @Post()
  @CalculateBudgetResponse()
  @ApiBody({ type: ValidateManyPointsDto })
  async handle(
    @Body(new ZodValidationPipe(calculateBudgetBodySchema))
    body: CalculateBudgetBodySchema,
    @Param("projectId") projectId: string,
  ) {
    const { points, spans } = body;

    // 1. Validação dos pontos
    const validationResult = await this.validateManyPointsUseCase.execute({
      projectId,
      points,
      spans,
    });

    if (validationResult.isLeft()) {
      const error = validationResult.value;
      switch (error.constructor.name) {
        case "ResourceNotFoundError":
          throw new NotFoundException(error.message);
        case "AlreadyRegisteredError":
          throw new ConflictException(error.message);
        case "NotAllowedError":
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { parsedPoints, project, parsedSpans } = validationResult.value;

    // 2. Cálculo do Orçamento (Entidades Puras)
    const budgetResult = await this.calculateBudgetUseCase.execute({
      project,
      parsedPoints,
      parsedSpans,
    });

    if (budgetResult.isLeft()) {
      const error = budgetResult.value;
      switch (error.constructor.name) {
        case "ResourceNotFoundError":
          throw new NotFoundException(error.message);
        case "NotAllowedError":
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { projectMaterials } = budgetResult.value;

    // --- MONTAGEM DO MODELO DE LEITURA (READ MODEL) ---

    // 3. Extrair os IDs para buscar no banco
    const idsByType = {
      cable: new Set<string>(),
      utilityPole: new Set<string>(),
      cableConnector: new Set<string>(),
      poleScrew: new Set<string>(),
      material: new Set<string>(),
    };
    const groupIds = new Set<string>();

    for (const pm of projectMaterials) {
      idsByType[pm.itemType].add(pm.itemId.toString());
      if (pm.groupSpecs) {
        groupIds.add(pm.groupSpecs.groupId.toString());
      }
    }

    // 4. Buscar os metadados do catálogo em paralelo
    const [cables, poles, connectors, screws, materials, groups] =
      await Promise.all([
        this.cablesRepository.findByIds(Array.from(idsByType.cable)),
        this.utilityPolesRepository.findByIds(
          Array.from(idsByType.utilityPole),
        ),
        this.cableConnectorsRepository.findByIds(
          Array.from(idsByType.cableConnector),
        ),
        this.poleScrewsRepository.findByIds(Array.from(idsByType.poleScrew)),
        this.materialsRepository.findByIds(Array.from(idsByType.material)),
        this.groupsRepository.findByIds(Array.from(groupIds)),
      ]);

    // 5. Mapear os dados num dicionário (O(1) Hash Map)
    const itemsCatalogMap = new Map<
      string,
      { code: number; description: string; unit: string }
    >();

    cables.forEach((c) =>
      itemsCatalogMap.set(c.id.toString(), {
        code: c.code,
        description: c.description,
        unit: c.unit,
      }),
    );
    poles.forEach((p) =>
      itemsCatalogMap.set(p.id.toString(), {
        code: p.code,
        description: p.description,
        unit: p.unit,
      }),
    );
    connectors.forEach((c) =>
      itemsCatalogMap.set(c.id.toString(), {
        code: c.code,
        description: c.description,
        unit: c.unit,
      }),
    );
    screws.forEach((s) =>
      itemsCatalogMap.set(s.id.toString(), {
        code: s.code,
        description: s.description,
        unit: s.unit,
      }),
    );
    materials.forEach((m) =>
      itemsCatalogMap.set(m.id.toString(), {
        code: m.code,
        description: m.description,
        unit: m.unit,
      }),
    );

    const groupsMap = new Map(groups.map((g) => [g.id.toString(), g]));
    const pointsMap = new Map(
      parsedPoints.map((p) => [p.point.id.toString(), p.point]),
    );

    // 6. Criar os Value Objects enriquecidos
    const projectMaterialsWithDetails = projectMaterials.map((pm) => {
      const catalogInfo = itemsCatalogMap.get(pm.itemId.toString());
      const point = pm.pointId
        ? pointsMap.get(pm.pointId.toString())
        : undefined;
      const group = pm.groupSpecs
        ? groupsMap.get(pm.groupSpecs.groupId.toString())
        : undefined;

      return ProjectMaterialWithDetails.create({
        id: pm.id,
        project,
        point,
        itemType: pm.itemType,
        itemCode: catalogInfo?.code ?? 0,
        itemDescription: catalogInfo?.description ?? "Item desconhecido",
        itemUnit: catalogInfo?.unit ?? "-",
        quantity: pm.quantity,
        groupSpecs:
          pm.groupSpecs && group
            ? {
                group,
                utilityPoleLevel: pm.groupSpecs.utilityPoleLevel,
                tensionLevel: pm.groupSpecs.tensionLevel,
              }
            : undefined,
      });
    });

    return {
      projectMaterials: projectMaterialsWithDetails.map(
        CalculateBudgetPresenter.toHTTPWithDetails,
      ),
    };
  }
}
