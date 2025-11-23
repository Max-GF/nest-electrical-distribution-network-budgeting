import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makePoint } from "test/factories/eletrical-distribution-budgeting/make-point";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { InMemoryPointsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-points-repository";
import { InMemoryProjectsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-repository";
import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { GetProjectPointUseCase } from "./get-points-by-project-id";

let inMemoryPointsRepository: InMemoryPointsRepository;
let inMemoryProjectsRepository: InMemoryProjectsRepository;
let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: GetProjectPointUseCase;

describe("Get Points by Project ID", () => {
  beforeEach(() => {
    inMemoryProjectsRepository = new InMemoryProjectsRepository();
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    inMemoryCablesRepository = new InMemoryCablesRepository();

    inMemoryPointsRepository = new InMemoryPointsRepository(
      inMemoryCablesRepository,
      inMemoryProjectsRepository,
      inMemoryUtilityPolesRepository,
    );
    sut = new GetProjectPointUseCase(inMemoryPointsRepository);
  });

  it("should be able to get points by project id", async () => {
    const project = makeProject();
    const projectId = project.id;

    inMemoryProjectsRepository.items.push(project);
    for (let i = 0; i < 50; i++) {
      inMemoryPointsRepository.items.push(makePoint({ projectId }));
    }
    // Create a point for another project to ensure it's not fetched
    inMemoryPointsRepository.items.push(
      makePoint({ projectId: new UniqueEntityID() }),
    );

    const result = await sut.execute({ projectId: projectId.toString() });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.points).toHaveLength(50);
      result.value.points.forEach((point) => {
        expect(point.project.id.toString()).toBe(projectId.toString());
      });
    }
  });

  it("should return an empty array if no points are found for the project", async () => {
    const result = await sut.execute({ projectId: "non-existing-project" });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.points).toHaveLength(0);
    }
  });
});
