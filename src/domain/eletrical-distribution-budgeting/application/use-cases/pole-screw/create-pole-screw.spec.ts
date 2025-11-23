import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { makePoleScrew } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { InMemoryPoleScrewsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-pole-screws-repository";
import { CreatePoleScrewUseCase } from "./create-pole-screw";

let inMemoryPoleScrewsRepository: InMemoryPoleScrewsRepository;
let sut: CreatePoleScrewUseCase;

describe("Create Pole Screw", () => {
  beforeEach(() => {
    inMemoryPoleScrewsRepository = new InMemoryPoleScrewsRepository();
    sut = new CreatePoleScrewUseCase(inMemoryPoleScrewsRepository);
  });

  it("should be able to create a pole screw", async () => {
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Pole Screw",
      unit: "UND",
      lengthInMM: 3000,
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryPoleScrewsRepository.items[0]).toEqual(
        result.value.poleScrew,
      );
    }
  });

  it("should not be able to create a pole screw with negative length", async () => {
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Pole Screw",
      unit: "UND",
      lengthInMM: -3000,
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeScrewLengthError);
      expect(result.value.message).toBe(
        "Pole Screw length must be greater than zero",
      );
    }
  });

  it("should not be able to create two or more pole screws with same code", async () => {
    const alreadyRegisteredPoleScrew = makePoleScrew({
      code: 123456,
    });
    await inMemoryPoleScrewsRepository.createMany([alreadyRegisteredPoleScrew]);
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Pole Screw",
      unit: "UND",
      lengthInMM: 3000,
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Pole Screw code already registered");
    }
  });
});
