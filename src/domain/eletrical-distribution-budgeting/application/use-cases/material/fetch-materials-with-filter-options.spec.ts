import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { FetchWithFilterMaterialsUseCase } from "./fetch-materials-with-filter-options";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let sut: FetchWithFilterMaterialsUseCase;

describe("Fetch materials with options", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    sut = new FetchWithFilterMaterialsUseCase(inMemoryMaterialsRepository);
  });

  it("should be able to fetch materials with diferent options", async () => {
    const materialsToCreate: Material[] = [];

    for (let i = 0; i < 70; i++) {
      materialsToCreate.push(
        makeMaterial({
          code: 1000 + i,
          tension: TensionLevel.create("LOW"),
        }),
      );
      materialsToCreate.push(
        makeMaterial({
          code: 2000 + i,
          description: `MATERIAL ${i}`,
          tension: TensionLevel.create("LOW"),
        }),
      );
      materialsToCreate.push(
        makeMaterial({
          code: 3000 + i,
          description: `13kV mat ${i}`,
          tension: TensionLevel.create("MEDIUM"),
        }),
      );
    }
    await inMemoryMaterialsRepository.createMany(materialsToCreate);
    expect(inMemoryMaterialsRepository.items).toHaveLength(210);
    const result1 = await sut.execute({ codes: [1000, 1001, 1002] });
    const result2 = await sut.execute({ description: "material" });
    const result3 = await sut.execute({ tension: "medium" });
    const result4 = await sut.execute({
      tension: "invalid_tension",
    });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(result1.value.materials).toHaveLength(3);
    }
    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.materials).toHaveLength(40);
      expect(result2.value.pagination.lastPage).toBe(2);
    }
    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      expect(result3.value.materials).toHaveLength(40);
      expect(result3.value.pagination.lastPage).toBe(2);
    }
    expect(result4.isLeft()).toBeTruthy();
    if (result4.isLeft()) {
      expect(result4.value).toBeInstanceOf(NotAllowedError);
      expect(result4.value.message).toBe(
        "Invalid tension level: invalid_tension. Valid values are: LOW, MEDIUM.",
      );
    }
  });
});
