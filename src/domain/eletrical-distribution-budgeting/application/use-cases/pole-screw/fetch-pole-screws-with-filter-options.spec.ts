import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { makePoleScrew } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { InMemoryPoleScrewsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-pole-screws-repository";
import { FetchWithFilterPoleScrewUseCase } from "./fetch-pole-screws-with-filter-options";

let inMemoryPoleScrewsRepository: InMemoryPoleScrewsRepository;
let sut: FetchWithFilterPoleScrewUseCase;

describe("Fetch pole screws with options", () => {
  beforeEach(() => {
    inMemoryPoleScrewsRepository = new InMemoryPoleScrewsRepository();
    sut = new FetchWithFilterPoleScrewUseCase(inMemoryPoleScrewsRepository);
  });

  it("should be able to fetch pole screws with diferent options", async () => {
    const poleScrewsToCreate: PoleScrew[] = [];

    for (let i = 0; i < 40; i++) {
      poleScrewsToCreate.push(
        makePoleScrew({
          code: 1000 + i,
          lengthInMM: 100 + i,
        }),
      );
      poleScrewsToCreate.push(
        makePoleScrew({
          code: 2000 + i,
          description: `POLE SCREW ${i}`,
          lengthInMM: 200 + i,
        }),
      );
      poleScrewsToCreate.push(
        makePoleScrew({
          code: 3000 + i,
          lengthInMM: 300 + i,
        }),
      );
    }
    await inMemoryPoleScrewsRepository.createMany(poleScrewsToCreate);
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(120);
    const result1 = await sut.execute({ codes: [1000, 1001, 1002] });
    const result2 = await sut.execute({ description: "pole screw" });
    const result3 = await sut.execute({ minLengthInMM: 300 });
    const result4 = await sut.execute({
      maxLengthInMM: 199,
    });
    const result5 = await sut.execute({
      minLengthInMM: 200,
      maxLengthInMM: 315,
    });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(result1.value.poleScrews).toHaveLength(3);
    }
    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.poleScrews).toHaveLength(40);
    }
    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      expect(result3.value.poleScrews).toHaveLength(40);
    }
    expect(result4.isRight()).toBeTruthy();
    if (result4.isRight()) {
      expect(result4.value.poleScrews).toHaveLength(40);
    }
    if (result5.isRight()) {
      expect(result5.value.poleScrews).toHaveLength(40);
    }
  });
});
