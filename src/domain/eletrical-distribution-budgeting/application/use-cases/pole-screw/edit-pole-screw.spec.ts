import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makePoleScrew } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { InMemoryPoleScrewsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-pole-screws-repository";
import { EditPoleScrewUseCase } from "./edit-pole-screw";

let inMemoryPoleScrewsRepository: InMemoryPoleScrewsRepository;
let sut: EditPoleScrewUseCase;

describe("Edit PoleScrew", () => {
  beforeEach(() => {
    inMemoryPoleScrewsRepository = new InMemoryPoleScrewsRepository();
    sut = new EditPoleScrewUseCase(inMemoryPoleScrewsRepository);
  });

  it("should be able to edit a pole screw", async () => {
    const poleScrewToEdit = makePoleScrew({
      code: 123456,
      description: "3000mm Pole Screw",
      unit: "MM",
      lengthInMM: 3000,
    });
    await inMemoryPoleScrewsRepository.createMany([poleScrewToEdit]);
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      poleScrewId: poleScrewToEdit.id.toString(),
      description: "4000mm Pole Screw",
      unit: "UND",
      lengthInMM: 4000,
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryPoleScrewsRepository.items[0]).toEqual(
        result.value.poleScrew,
      );
      expect(inMemoryPoleScrewsRepository.items[0].description).toBe(
        "4000MM POLE SCREW",
      );
    }
  });

  it("should not be able to edit a pole screw with negative length", async () => {
    const poleScrewToEdit = makePoleScrew({
      code: 123456,
      description: "3000mm Pole Screw",
      lengthInMM: 3000,
    });
    await inMemoryPoleScrewsRepository.createMany([poleScrewToEdit]);
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      poleScrewId: poleScrewToEdit.id.toString(),
      description: "4000mm Pole Screw",
      lengthInMM: -4000,
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeScrewLengthError);
      expect(result.value.message).toBe("Length must be greater than zero");
    }
  });

  it("should not be able to edit unexisting pole screw", async () => {
    const result = await sut.execute({
      poleScrewId: "unexisting-id",
      description: "4000mm Pole Screw",
      lengthInMM: 4000,
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Given pole screw was not found");
    }
  });
  it("should not be able to edit a pole screw when no entries was given", async () => {
    const poleScrewToEdit = makePoleScrew({
      code: 123456,
      description: "3000mm Pole Screw",
      lengthInMM: 3000,
    });
    await inMemoryPoleScrewsRepository.createMany([poleScrewToEdit]);
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    const result = await sut.execute({
      poleScrewId: poleScrewToEdit.id.toString(),
    });

    expect(inMemoryPoleScrewsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
});
