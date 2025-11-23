import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { FetchWithFilterUtilityPoleUseCase } from "./fetch-utility-poles-with-filter";

let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let sut: FetchWithFilterUtilityPoleUseCase;

describe("Create Utility Pole", () => {
  beforeEach(() => {
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    sut = new FetchWithFilterUtilityPoleUseCase(inMemoryUtilityPolesRepository);
  });

  it("should be able to fetch utility poles with diferent options", async () => {
    const utilityPolesToCreate: UtilityPole[] = [];

    for (let i = 0; i < 40; i++) {
      utilityPolesToCreate.push(
        makeUtilityPole({
          code: 1000 + i,
          lowVoltageLevelsCount: 1,
          mediumVoltageLevelsCount: 1,
        }),
      );
      utilityPolesToCreate.push(
        makeUtilityPole({
          code: 2000 + i,
          description: `UTILITY POLE ${i}`,
          lowVoltageLevelsCount: 1,
          mediumVoltageLevelsCount: 1,
        }),
      );
      utilityPolesToCreate.push(
        makeUtilityPole({
          code: 3000 + i,
          lowVoltageLevelsCount: 2 + i,
          mediumVoltageLevelsCount: 1,
        }),
      );
      utilityPolesToCreate.push(
        makeUtilityPole({
          code: 4000 + i,
          lowVoltageLevelsCount: 1,
          mediumVoltageLevelsCount: 5 + i,
        }),
      );
    }
    await inMemoryUtilityPolesRepository.createMany(utilityPolesToCreate);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(160);
    const result1 = await sut.execute({ codes: [1000, 1001, 1002] });
    const result2 = await sut.execute({ description: "utility pole" });
    const result3 = await sut.execute({ minimumCountForLowVoltageLevels: 2 });
    const result4 = await sut.execute({
      minimumCountForMediumVoltageLevels: 5,
    });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(result1.value.utilityPoles).toHaveLength(3);
    }
    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.utilityPoles).toHaveLength(40);
    }
    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      expect(result3.value.utilityPoles).toHaveLength(40);
    }
    expect(result4.isRight()).toBeTruthy();
    if (result4.isRight()) {
      expect(result4.value.utilityPoles).toHaveLength(40);
    }
  });
});
