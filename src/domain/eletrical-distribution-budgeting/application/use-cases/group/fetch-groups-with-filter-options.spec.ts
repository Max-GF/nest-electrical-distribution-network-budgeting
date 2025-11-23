import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import {
  GroupCableConnectorWithDetailsProps,
  GroupItemWithDetails,
  GroupMaterialWithDetailsProps,
  GroupPoleScrewWithDetailsProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/group-item-with-details";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeGroupItem } from "test/factories/eletrical-distribution-budgeting/make-group-item";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryGroupItemsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-group-items-repository";
import { InMemoryGroupsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-groups-repository";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { FetchGroupUseCase } from "./fetch-groups-with-filter-options";

let inMemoryGroupItemsRepository: InMemoryGroupItemsRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let sut: FetchGroupUseCase;

describe("Fetch groups with options", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    inMemoryGroupItemsRepository = new InMemoryGroupItemsRepository(
      inMemoryMaterialsRepository,
    );
    inMemoryGroupsRepository = new InMemoryGroupsRepository(
      inMemoryGroupItemsRepository,
    );
    sut = new FetchGroupUseCase(inMemoryGroupsRepository);
  });

  it("should be able to fetch groups with different options", async () => {
    const groupsToCreate: Group[] = [];
    const groupsItemsToCreate: GroupItem[] = [];

    for (let i = 0; i < 40; i++) {
      groupsToCreate.push(
        makeGroup({
          name: `GROUP-A-${i}`,
          tension: TensionLevel.create("LOW"),
        }),
      );
      groupsItemsToCreate.push(
        ...Array.from({ length: 5 }).map(() =>
          makeGroupItem({
            groupId: groupsToCreate[i].id,
          }),
        ),
      );
      groupsToCreate.push(
        makeGroup({
          name: `GROUP-B-${i}`,
          description: `Description for B ${i}`,
          tension: TensionLevel.create("LOW"),
        }),
      );
      groupsItemsToCreate.push(
        ...Array.from({ length: 5 }).map(() =>
          makeGroupItem({
            groupId: groupsToCreate[i + 1].id,
          }),
        ),
      );
      groupsToCreate.push(
        makeGroup({
          name: `GROUP-C-${i}`,
          tension: TensionLevel.create("MEDIUM"),
        }),
      );
      groupsItemsToCreate.push(
        ...Array.from({ length: 5 }).map(() =>
          makeGroupItem({
            groupId: groupsToCreate[i + 2].id,
          }),
        ),
      );
    }
    const itemsMaterials = groupsItemsToCreate
      .filter((item) => item.isMaterial())
      .map((item) => makeMaterial({}, item.materialId));

    await Promise.all([
      inMemoryMaterialsRepository.createMany(itemsMaterials),
      inMemoryGroupItemsRepository.createMany(groupsItemsToCreate),
      inMemoryGroupsRepository.createMany(groupsToCreate),
    ]);
    expect(inMemoryMaterialsRepository.items.length).greaterThanOrEqual(0);
    expect(inMemoryGroupItemsRepository.items).toHaveLength(600);
    expect(inMemoryGroupsRepository.items).toHaveLength(120);

    const result1 = await sut.execute({ name: "group-a" });
    const result2 = await sut.execute({ description: "description for b" });
    const result3 = await sut.execute({ tension: "MEDIUM" });
    const result4 = await sut.execute({ tension: "low", pageSize: 80 });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(result1.value.groupWithDetailedItems).toHaveLength(20);
      result1.value.groupWithDetailedItems.forEach((groupWithDetails) => {
        groupWithDetails.itemsWithDetails.forEach((groupItem) => {
          if (groupItem.isPoleScrew()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupPoleScrewWithDetailsProps>,
            );
          } else if (groupItem.isMaterial()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupMaterialWithDetailsProps>,
            );
            expect(groupItem.material).toBeInstanceOf(Material);
          } else if (groupItem.isCableConnector()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupCableConnectorWithDetailsProps>,
            );
          } else {
            throw new Error("Unexpected group item type");
          }
        });
      });
      expect(result1.value.pagination.lastPage).toBe(2);
    }

    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(result2.value.groupWithDetailedItems).toHaveLength(20);
      expect(result2.value.pagination.lastPage).toBe(2);
      result2.value.groupWithDetailedItems.forEach((groupWithDetails) => {
        groupWithDetails.itemsWithDetails.forEach((groupItem) => {
          if (groupItem.isPoleScrew()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupPoleScrewWithDetailsProps>,
            );
          } else if (groupItem.isMaterial()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupMaterialWithDetailsProps>,
            );
            expect(groupItem.material).toBeInstanceOf(Material);
          } else if (groupItem.isCableConnector()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupCableConnectorWithDetailsProps>,
            );
          } else {
            throw new Error("Unexpected group item type");
          }
        });
      });
    }

    expect(result3.isRight()).toBeTruthy();
    if (result3.isRight()) {
      expect(result3.value.groupWithDetailedItems).toHaveLength(20);
      expect(result3.value.pagination.lastPage).toBe(2);
      result3.value.groupWithDetailedItems.forEach((groupWithDetails) => {
        groupWithDetails.itemsWithDetails.forEach((groupItem) => {
          if (groupItem.isPoleScrew()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupPoleScrewWithDetailsProps>,
            );
          } else if (groupItem.isMaterial()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupMaterialWithDetailsProps>,
            );
            expect(groupItem.material).toBeInstanceOf(Material);
          } else if (groupItem.isCableConnector()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupCableConnectorWithDetailsProps>,
            );
          } else {
            throw new Error("Unexpected group item type");
          }
        });
      });
    }

    expect(result4.isRight()).toBeTruthy();
    if (result4.isRight()) {
      expect(result4.value.groupWithDetailedItems).toHaveLength(80);
      expect(result4.value.pagination.lastPage).toBe(1);
      result4.value.groupWithDetailedItems.forEach((groupWithDetails) => {
        groupWithDetails.itemsWithDetails.forEach((groupItem) => {
          if (groupItem.isPoleScrew()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupPoleScrewWithDetailsProps>,
            );
          } else if (groupItem.isMaterial()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupMaterialWithDetailsProps>,
            );
            expect(groupItem.material).toBeInstanceOf(Material);
          } else if (groupItem.isCableConnector()) {
            expect(groupItem).toBeInstanceOf(
              GroupItemWithDetails<GroupCableConnectorWithDetailsProps>,
            );
          } else {
            throw new Error("Unexpected group item type");
          }
        });
      });
    }
  });

  it("should not be able to fetch groups with invalid pagination params", async () => {
    const result1 = await sut.execute({ page: 1, pageSize: -5 });
    const result2 = await sut.execute({ page: -3, pageSize: 10 });
    const result3 = await sut.execute({ page: 1, pageSize: 0 });
    const result4 = await sut.execute({ page: 0, pageSize: 10 });

    expect(result1.isLeft()).toBeTruthy();
    if (result1.isLeft()) {
      expect(result1.value).toBeInstanceOf(NotAllowedError);
      expect(result1.value.message).toBe("Page size must be greater than 0.");
    }

    expect(result2.isLeft()).toBeTruthy();
    if (result2.isLeft()) {
      expect(result2.value).toBeInstanceOf(NotAllowedError);
      expect(result2.value.message).toBe("Page must be greater than 0.");
    }
    expect(result3.isLeft()).toBeTruthy();
    if (result3.isLeft()) {
      expect(result3.value).toBeInstanceOf(NotAllowedError);
      expect(result3.value.message).toBe("Page size must be greater than 0.");
    }
    expect(result4.isLeft()).toBeTruthy();
    if (result4.isLeft()) {
      expect(result4.value).toBeInstanceOf(NotAllowedError);
      expect(result4.value.message).toBe("Page must be greater than 0.");
    }
  });
});
