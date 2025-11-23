import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { CreateMaterialUseCase } from "./create-material";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let sut: CreateMaterialUseCase;

describe("Create Material", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    sut = new CreateMaterialUseCase(inMemoryMaterialsRepository);
  });

  it("should be able to create a material", async () => {
    expect(inMemoryMaterialsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "Some Material",
      unit: "UND",
      tension: "low",
    });

    expect(inMemoryMaterialsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryMaterialsRepository.items[0]).toEqual(
        result.value.material,
      );
    }
  });

  it("should not be able to create two or more materials with same code", async () => {
    const alreadyRegisteredMaterial = makeMaterial({
      code: 123456,
    });
    await inMemoryMaterialsRepository.createMany([alreadyRegisteredMaterial]);
    expect(inMemoryMaterialsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      code: 123456,
      description: "Some Material 2",
      unit: "UND",
      tension: "low",
    });

    expect(inMemoryMaterialsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Material code already registered");
    }
  });
});
