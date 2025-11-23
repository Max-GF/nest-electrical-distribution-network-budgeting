import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { InMemoryUsersRepository } from "test/repositories/user-management/in-memory-users-repository";
import { FetchUsersWithFilteredOptionsUseCase } from "./fetch-users-with-filtered-options";

let inMemoryBasesRepository: InMemoryBasesRepository;
let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;
let sut: FetchUsersWithFilteredOptionsUseCase;

describe("Fetch Users filtered opttions", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    inMemoryAvatarsRepository = new InMemoryAvatarsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
      inMemoryAvatarsRepository,
    );
    sut = new FetchUsersWithFilteredOptionsUseCase(inMemoryUsersRepository);
  });

  it("should fetch users with details across multiple companies and bases", async () => {
    // Creating 2 companies
    // with 2 bases each and 10 users in each base
    const company1 = makeCompany({}, new UniqueEntityID("Company1"));
    const company2 = makeCompany({}, new UniqueEntityID("Company2"));

    const base1Company1 = makeBase(
      {
        companyId: company1.id,
      },
      new UniqueEntityID("Base1Company1"),
    );
    const base2Company1 = makeBase(
      {
        companyId: company1.id,
      },
      new UniqueEntityID("Base2Company1"),
    );
    const base1Company2 = makeBase(
      {
        companyId: company2.id,
      },
      new UniqueEntityID("Base1Company2"),
    );
    const base2Company2 = makeBase(
      {
        companyId: company2.id,
      },
      new UniqueEntityID("Base2Company2"),
    );

    const usersBase1Company1 = Array.from({ length: 10 }, (_, i) =>
      makeUser(
        {
          baseId: base1Company1.id,
          companyId: company1.id,
        },
        new UniqueEntityID(`UserBase1Company1-${i}`),
      ),
    );

    const usersBase2Company1 = Array.from({ length: 10 }, (_, i) =>
      makeUser(
        {
          baseId: base2Company1.id,
          companyId: company1.id,
        },
        new UniqueEntityID(`UserBase2Company1-${i}`),
      ),
    );

    const usersBase1Company2 = Array.from({ length: 10 }, (_, i) =>
      makeUser(
        {
          baseId: base1Company2.id,
          companyId: company2.id,
        },
        new UniqueEntityID(`UserBase1Company2-${i}`),
      ),
    );

    const usersBase2Company2 = Array.from({ length: 10 }, (_, i) =>
      makeUser(
        {
          baseId: base2Company2.id,
          companyId: company2.id,
        },
        new UniqueEntityID(`UserBase2Company2-${i}`),
      ),
    );
    await Promise.all([
      inMemoryCompaniesRepository.createMany([company1, company2]),
      inMemoryBasesRepository.createMany([
        base1Company1,
        base2Company1,
        base1Company2,
        base2Company2,
      ]),
      inMemoryUsersRepository.createMany([
        ...usersBase1Company1,
        ...usersBase2Company1,
        ...usersBase1Company2,
        ...usersBase2Company2,
      ]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(40);
    const result = await sut.execute({
      basesIds: ["Base1Company1", "Base2Company1"],
      page: 1,
      pageSize: 40,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const { users } = result.value;

      expect(users).toHaveLength(20);
      users.forEach((user) => {
        expect(
          ["Base1Company1", "Base2Company1"].includes(user.base.id.toString()),
        ).toBeTruthy();
      });
    }
    const result2 = await sut.execute({
      companiesIds: ["Company2"],
      page: 1,
      pageSize: 40,
    });

    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      const { users } = result2.value;

      expect(users).toHaveLength(20);
      users.forEach((user) => {
        expect(user.company.id.toString()).toBe("Company2");
      });
    }
    const result3 = await sut.execute({
      basesIds: ["Base2Company2"],
      roles: ["ADMIN"],
      isActive: true,
      page: 1,
      pageSize: 40,
    });

    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      const { users } = result3.value;
      expect(users.length).toBeLessThanOrEqual(10);
      users.forEach((user) => {
        expect(user.isActive).toBeTruthy();
        expect(user.base.id.toString()).toBe("Base2Company2");
        expect(user.role).toBe("ADMIN");
      });
    }
  });
});
