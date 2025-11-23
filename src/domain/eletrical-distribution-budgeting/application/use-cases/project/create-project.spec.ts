import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { InMemoryProjectsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-repository";
import { CreateProjectUseCase } from "./create-project";

let inMemoryProjectsRepository: InMemoryProjectsRepository;
let sut: CreateProjectUseCase;

describe("Create Project", () => {
  beforeEach(() => {
    inMemoryProjectsRepository = new InMemoryProjectsRepository();
    sut = new CreateProjectUseCase(inMemoryProjectsRepository);
  });

  it("should be able to create a project", async () => {
    const result = await sut.execute({
      name: "PROJECT-01",
      description: "Project 01 description",
      budgetAlreadyCalculated: false,
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProjectsRepository.items).toHaveLength(1);
    expect(inMemoryProjectsRepository.items[0].name).toBe("PROJECT-01");
  });

  it("should not be able to create a project with same name", async () => {
    await sut.execute({
      name: "PROJECT-01",
      description: "Project 01 description",
      budgetAlreadyCalculated: false,
    });

    const result = await sut.execute({
      name: "PROJECT-01",
      description: "Project 01 description",
      budgetAlreadyCalculated: false,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Project name already registered");
    }
  });
});
