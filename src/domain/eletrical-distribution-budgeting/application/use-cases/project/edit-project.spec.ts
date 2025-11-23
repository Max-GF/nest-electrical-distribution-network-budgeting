import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { InMemoryProjectsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-repository";
import { EditProjectUseCase } from "./edit-project";

let inMemoryProjectsRepository: InMemoryProjectsRepository;
let sut: EditProjectUseCase;

describe("Edit Project", () => {
  beforeEach(() => {
    inMemoryProjectsRepository = new InMemoryProjectsRepository();
    sut = new EditProjectUseCase(inMemoryProjectsRepository);
  });

  it("should be able to edit a project", async () => {
    const project = makeProject({
      name: "Old Name",
      description: "Old Description",
      budgetAlreadyCalculated: false,
    });
    inMemoryProjectsRepository.createMany([project]);

    const result = await sut.execute({
      projectId: project.id.toString(),
      name: "New Name",
      description: "New Description",
      budgetAlreadyCalculated: true,
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProjectsRepository.items[0].name).toBe("New Name");
    expect(inMemoryProjectsRepository.items[0].description).toBe(
      "New Description",
    );
    expect(inMemoryProjectsRepository.items[0].budgetAlreadyCalculated).toBe(
      true,
    );
    expect(
      inMemoryProjectsRepository.items[0].lastBudgetCalculatedAt,
    ).toBeInstanceOf(Date);
    expect(inMemoryProjectsRepository.items[0]).toBe(
      result.isRight() ? result.value.project : null,
    );
  });

  it("should not be able to edit a project with no fields to edit", async () => {
    const project = makeProject();
    inMemoryProjectsRepository.createMany([project]);

    const result = await sut.execute({
      projectId: project.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "At least one field must be provided to edit",
      );
    }
  });

  it("should not be able to edit a project with same fields", async () => {
    const project = makeProject({
      name: "Same Name",
      description: "Same Description",
      budgetAlreadyCalculated: false,
    });
    inMemoryProjectsRepository.createMany([project]);

    const result = await sut.execute({
      projectId: project.id.toString(),
      name: "Same Name",
      description: "Same Description",
      budgetAlreadyCalculated: false,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "At least one field must be different to edit",
      );
    }
  });
});
