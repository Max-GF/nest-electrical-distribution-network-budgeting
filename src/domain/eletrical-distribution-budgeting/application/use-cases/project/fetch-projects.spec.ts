import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { InMemoryProjectsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-repository";
import { FetchProjectsUseCase } from "./fetch-projects";

let inMemoryProjectsRepository: InMemoryProjectsRepository;
let sut: FetchProjectsUseCase;

describe("Fetch Projects", () => {
  beforeEach(() => {
    inMemoryProjectsRepository = new InMemoryProjectsRepository();
    sut = new FetchProjectsUseCase(inMemoryProjectsRepository);
  });

  it("should be able to fetch projects", async () => {
    const projectsToCreate: Project[] = [];
    for (let i = 0; i < 5; i++) {
      projectsToCreate.push(makeProject());
    }
    inMemoryProjectsRepository.createMany(projectsToCreate);

    const result = await sut.execute({});

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.projects).toHaveLength(5);
    }
  });

  it("should be able to fetch projects with name filter", async () => {
    const projectsToCreate: Project[] = [];
    for (let i = 0; i < 5; i++) {
      projectsToCreate.push(makeProject({ name: `PROJECT-${i}` }));
    }
    inMemoryProjectsRepository.createMany(projectsToCreate);

    const result = await sut.execute({ name: "PROJECT-1" });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.projects).toHaveLength(1);
      expect(result.value.projects[0].name).toBe("PROJECT-1");
    }
  });

  it("should be able to fetch projects with description filter", async () => {
    const projectsToCreate: Project[] = [];
    for (let i = 0; i < 5; i++) {
      projectsToCreate.push(
        makeProject({ description: `Description for project ${i}` }),
      );
    }
    inMemoryProjectsRepository.createMany(projectsToCreate);

    const result = await sut.execute({ description: "project 2" });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.projects).toHaveLength(1);
      expect(result.value.projects[0].description).toBe(
        "Description for project 2",
      );
    }
  });

  it("should be able to fetch projects with budgetAlreadyCalculated filter", async () => {
    const projectsToCreate: Project[] = [];
    projectsToCreate.push(makeProject({ budgetAlreadyCalculated: true }));
    projectsToCreate.push(makeProject({ budgetAlreadyCalculated: true }));
    projectsToCreate.push(makeProject({ budgetAlreadyCalculated: false }));
    inMemoryProjectsRepository.createMany(projectsToCreate);

    const result = await sut.execute({ budgetAlreadyCalculated: true });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.projects).toHaveLength(2);
    }
  });

  it("should be able to fetch paginated projects", async () => {
    for (let i = 1; i <= 55; i++) {
      inMemoryProjectsRepository.items.push(makeProject());
    }

    const result = await sut.execute({ page: 2, pageSize: 40 });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.projects).toHaveLength(15);
      expect(result.value.pagination.lastPage).toBe(2);
    }
  });

  it("should be able to fetch projects with date filters", async () => {
    const dateInThePast = new Date("2023-01-01");
    const dateInTheFuture = new Date("2025-01-01");

    inMemoryProjectsRepository.items.push(
      makeProject({ lastBudgetCalculatedAt: new Date("2022-12-31") }),
    );
    inMemoryProjectsRepository.items.push(
      makeProject({ lastBudgetCalculatedAt: dateInThePast }),
    );
    inMemoryProjectsRepository.items.push(
      makeProject({ lastBudgetCalculatedAt: new Date("2024-01-01") }),
    );
    inMemoryProjectsRepository.items.push(
      makeProject({ lastBudgetCalculatedAt: dateInTheFuture }),
    );
    inMemoryProjectsRepository.items.push(
      makeProject({ lastBudgetCalculatedAt: new Date("2025-01-02") }),
    );

    const resultAfter = await sut.execute({
      calculatedDateOptions: { after: dateInThePast },
    });
    expect(resultAfter.isRight()).toBeTruthy();
    if (resultAfter.isRight()) {
      expect(resultAfter.value.projects).toHaveLength(4);
    }

    const resultBefore = await sut.execute({
      calculatedDateOptions: { before: dateInTheFuture },
    });
    expect(resultBefore.isRight()).toBeTruthy();
    if (resultBefore.isRight()) {
      expect(resultBefore.value.projects).toHaveLength(4);
    }

    const resultBetween = await sut.execute({
      calculatedDateOptions: { after: dateInThePast, before: dateInTheFuture },
    });
    expect(resultBetween.isRight()).toBeTruthy();
    if (resultBetween.isRight()) {
      expect(resultBetween.value.projects).toHaveLength(3);
    }
  });

  it("should return error for invalid pagination", async () => {
    const resultPage = await sut.execute({ page: 0 });
    expect(resultPage.isLeft()).toBeTruthy();
    if (resultPage.isLeft()) {
      expect(resultPage.value).toBeInstanceOf(NotAllowedError);
    }

    const resultPageSize = await sut.execute({ pageSize: -1 });
    expect(resultPageSize.isLeft()).toBeTruthy();
    if (resultPageSize.isLeft()) {
      expect(resultPageSize.value).toBeInstanceOf(NotAllowedError);
    }
  });

  it("should return error for invalid date range", async () => {
    const result = await sut.execute({
      calculatedDateOptions: {
        after: new Date("2024-01-01"),
        before: new Date("2023-01-01"),
      },
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});
