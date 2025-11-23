import { left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";
import { makePoint } from "test/factories/eletrical-distribution-budgeting/make-point";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { InMemoryProjectsBudgetRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-budget-repository";
import { CalculateBudgetUseCase } from "../budget/calculate-budget";
import {
  ParsedPointToCreate,
  ValidateManyPointsUseCase,
} from "../point/validate-many-points";
import { BuildProjectBudgetUseCase } from "./build-project-budget";

describe("Build Project Budget Use Case", () => {
  let inMemoryProjectsBudgetRepository: InMemoryProjectsBudgetRepository;
  let validateManyPointsUseCase: ValidateManyPointsUseCase;
  let calculateBudgetUseCase: CalculateBudgetUseCase;
  let sut: BuildProjectBudgetUseCase;

  beforeEach(() => {
    inMemoryProjectsBudgetRepository = new InMemoryProjectsBudgetRepository();

    // Esse 'as unknown as ...' é para enganar o TypeScript,
    // pois não o testes desses casos de uso já foram
    // executados em outros arquivos
    validateManyPointsUseCase = {
      execute: vi.fn(),
    } as unknown as ValidateManyPointsUseCase;

    calculateBudgetUseCase = {
      execute: vi.fn(),
    } as unknown as CalculateBudgetUseCase;

    sut = new BuildProjectBudgetUseCase(
      validateManyPointsUseCase,
      calculateBudgetUseCase,
      inMemoryProjectsBudgetRepository,
    );
  });

  it("should orchestrate validation, calculation and saving successfully", async () => {
    const project = makeProject({}, new UniqueEntityID("proj-1"));
    const point = makePoint({}, new UniqueEntityID("point-1"));
    const parsedPointsStub = [{ point }];

    const projectMaterialStub = ProjectMaterial.create({
      itemId: new UniqueEntityID("item-1"),
      itemType: "material",
      pointId: point.id,
      projectId: project.id,
      quantity: 10,
    });

    vi.spyOn(validateManyPointsUseCase, "execute").mockResolvedValue(
      right({
        project,
        parsedPoints: parsedPointsStub as unknown as ParsedPointToCreate[],
      }),
    );

    vi.spyOn(calculateBudgetUseCase, "execute").mockResolvedValue(
      right({
        project,
        projectMaterials: [projectMaterialStub],
      }),
    );

    const result = await sut.execute({
      projectId: "proj-1",
      points: [],
    });

    expect(result.isRight()).toBeTruthy();
    expect(project.budgetAlreadyCalculated).toBe(true);

    // Verifica se salvou no repositório
    expect(inMemoryProjectsBudgetRepository.savedMaterials).toHaveLength(1);
    expect(inMemoryProjectsBudgetRepository.savedMaterials[0]).toEqual(
      projectMaterialStub,
    );
    expect(inMemoryProjectsBudgetRepository.savedPoints).toHaveLength(1);

    // Verifica se os métodos dependentes foram chamados
    expect(validateManyPointsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(calculateBudgetUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it("should return error if validation fails", async () => {
    vi.spyOn(validateManyPointsUseCase, "execute").mockResolvedValue(
      left(new ResourceNotFoundError("Project not found")),
    );

    const result = await sut.execute({
      projectId: "invalid-id",
      points: [],
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);

    // Garante que parou o fluxo e não chamou o cálculo nem o save
    expect(calculateBudgetUseCase.execute).not.toHaveBeenCalled();
    expect(inMemoryProjectsBudgetRepository.savedMaterials).toHaveLength(0);
  });

  it("should return error if calculation fails", async () => {
    const project = makeProject({});

    vi.spyOn(validateManyPointsUseCase, "execute").mockResolvedValue(
      right({ project, parsedPoints: [] }),
    );

    vi.spyOn(calculateBudgetUseCase, "execute").mockResolvedValue(
      left(new NotAllowedError("Calculation error")),
    );

    const result = await sut.execute({
      projectId: "proj-1",
      points: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Calculation error");
    }

    // Garante que não salvou no banco
    expect(inMemoryProjectsBudgetRepository.savedMaterials).toHaveLength(0);
  });

  it("should return NotAllowedError if repository throws an exception", async () => {
    const project = makeProject({});

    // Mocks de Sucesso nos UseCases
    vi.spyOn(validateManyPointsUseCase, "execute").mockResolvedValue(
      right({
        project,
        parsedPoints: [
          { point: makePoint({}) },
        ] as unknown as ParsedPointToCreate[],
      }),
    );
    vi.spyOn(calculateBudgetUseCase, "execute").mockResolvedValue(
      right({ project, projectMaterials: [] }),
    );

    // Mock do Repositório lançando exceção
    vi.spyOn(
      inMemoryProjectsBudgetRepository,
      "saveProjectBudgetMaterials",
    ).mockRejectedValue(new Error("Database connection failed"));

    const result = await sut.execute({
      projectId: "proj-1",
      points: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain(
        "Could not save project budget materials",
      );
      expect(result.value.message).toContain("Database connection failed");
    }
  });
});
