import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { FetchWithFilterCableUseCase } from "./fetch-cables-with-filter-options";

let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: FetchWithFilterCableUseCase;

describe("Fetch cables with options", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    sut = new FetchWithFilterCableUseCase(inMemoryCablesRepository);
  });

  it("should be able to fetch cables with diferent options", async () => {
    const cablesToCreate: Cable[] = [];

    for (let i = 0; i < 40; i++) {
      cablesToCreate.push(
        makeCable({
          code: 1000 + i,
          sectionAreaInMM: 100 + i,
          tension: TensionLevel.create("LOW"),
        }),
      );
      cablesToCreate.push(
        makeCable({
          code: 2000 + i,
          description: `CABLE ${i}`,
          sectionAreaInMM: 200 + i,
          tension: TensionLevel.create("LOW"),
        }),
      );
      cablesToCreate.push(
        makeCable({
          code: 3000 + i,
          sectionAreaInMM: 300 + i,
          tension: TensionLevel.create("MEDIUM"),
        }),
      );
    }
    await inMemoryCablesRepository.createMany(cablesToCreate);
    expect(inMemoryCablesRepository.items).toHaveLength(120);
    expect(
      inMemoryCablesRepository.items.filter(
        (item) => item.tension.value === "LOW",
      ),
    ).toHaveLength(80);
    const result1 = await sut.execute({ codes: [1000, 1001, 1002] });
    const result2 = await sut.execute({ description: "cable" });
    const result3 = await sut.execute({ minSectionAreaInMM: 300 });
    const result4 = await sut.execute({
      maxSectionAreaInMM: 199,
    });
    const result5 = await sut.execute({
      minSectionAreaInMM: 200,
      maxSectionAreaInMM: 315,
    });
    const result6 = await sut.execute({ tension: "LOW", pageSize: 80 });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(result1.value.cables).toHaveLength(3);
    }
    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.cables).toHaveLength(40);
    }
    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      expect(result3.value.cables).toHaveLength(40);
    }
    expect(result4.isRight()).toBeTruthy();
    if (result4.isRight()) {
      expect(result4.value.cables).toHaveLength(40);
    }
    expect(result5.isRight()).toBeTruthy();
    if (result5.isRight()) {
      expect(result5.value.cables).toHaveLength(40);
    }
    expect(result6.isRight()).toBeTruthy();
    if (result6.isRight()) {
      expect(result6.value.cables).toHaveLength(80);
    }
  });
});
