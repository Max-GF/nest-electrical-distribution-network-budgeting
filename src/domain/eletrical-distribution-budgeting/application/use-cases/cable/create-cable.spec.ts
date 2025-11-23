import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { CreateCableUseCase } from "./create-cable";

let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: CreateCableUseCase;

describe("Create Cable", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    sut = new CreateCableUseCase(inMemoryCablesRepository);
  });

  it("should be able to create a Cable", async () => {
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm Cable",
      unit: "MM",
      sectionAreaInMM: 1000,
      tension: "LOW",
    });

    expect(inMemoryCablesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCablesRepository.items[0]).toEqual(result.value.cable);
    }
  });
  it("should be not able to create two or more cables with same code", async () => {
    const alreadyRegistedCable = makeCable({ code: 123456 });
    await inMemoryCablesRepository.createMany([alreadyRegistedCable]);
    expect(inMemoryCablesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm cable",
      unit: "MM",
      sectionAreaInMM: 32132,
      tension: "LOW",
    });

    expect(inMemoryCablesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Cable code already registered");
    }
  });
  it("should not be able a cable with section area equals or less than zero", async () => {
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm cable",
      unit: "MM",
      sectionAreaInMM: 0,
      tension: "LOW",
    });

    expect(inMemoryCablesRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeCableSectionError);
      expect(result.value.message).toBe(
        "Cable section area must be greater than zero",
      );
    }
  });
  it("should not be able to create a cable with invalid tension level", async () => {
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "3000mm cable",
      unit: "MM",
      sectionAreaInMM: 1000,
      tension: "HIGH",
    });

    expect(inMemoryCablesRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Invalid tension level: HIGH. Valid values are: LOW, MEDIUM.",
      );
    }
  });
});
