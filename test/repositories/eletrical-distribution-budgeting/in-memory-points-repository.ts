import { PointsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/points-repository";
import { UtilityPolesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { PointWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/point-with-details";
import { InMemoryCablesRepository } from "./in-memory-cables-repository";
import { InMemoryProjectsRepository } from "./in-memory-projects-repository";

export class InMemoryPointsRepository implements PointsRepository {
  public items: Point[] = [];
  constructor(
    private cablesRepository: InMemoryCablesRepository,
    private projectsRepository: InMemoryProjectsRepository,
    private utilityPolesRepository: UtilityPolesRepository,
  ) {}

  async createMany(points: Point[]): Promise<void> {
    this.items.push(...points);
  }
  async save(point: Point): Promise<void> {
    const pointToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === point.id.toString(),
    );
    if (pointToSaveIndex >= 0) {
      this.items[pointToSaveIndex] = point;
    }
  }
  async findById(id: string): Promise<Point | null> {
    const foundedPoint = this.items.find(
      (item) => item.id.toString() === id.toString(),
    );
    return foundedPoint ?? null;
  }
  async findByIds(ids: string[]): Promise<Point[]> {
    const foundedPoints = this.items.filter((item) =>
      ids.includes(item.id.toString()),
    );
    return foundedPoints;
  }
  async findByNameAndProjectId(
    name: string,
    projectId: string,
  ): Promise<Point | null> {
    const foundedPoint = this.items.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.projectId.toString() === projectId.toString(),
    );
    return foundedPoint ?? null;
  }
  async findAllByProjectId(projectId: string): Promise<Point[]> {
    const foundedPoints = this.items.filter(
      (item) => item.projectId.toString() === projectId.toString(),
    );
    return foundedPoints;
  }
  async findAllWithDetailsByProjectId(
    projectId: string,
  ): Promise<PointWithDetails[]> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      return [];
    }
    const foundedPoints = this.items.filter(
      (item) => item.projectId.toString() === projectId.toString(),
    );
    if (foundedPoints.length === 0) {
      return [];
    }
    const pointsCablesIds = Array.from(
      new Set(
        foundedPoints
          .map((point) => [
            point.lowTensionEntranceCableId?.toString(),
            point.lowTensionExitCableId?.toString(),
            point.mediumTensionEntranceCableId?.toString(),
            point.mediumTensionExitCableId?.toString(),
          ])
          .flat()
          .filter((id) => id !== undefined),
      ),
    );
    const cables = await this.cablesRepository.findByIds(pointsCablesIds);
    const utilityPolesIds = Array.from(
      new Set(
        foundedPoints
          .map((point) => point.utilityPoleId?.toString())
          .filter((id) => id !== undefined),
      ),
    );
    const utilityPoles =
      await this.utilityPolesRepository.findByIds(utilityPolesIds);

    const cablesMap = new Map(
      cables.map((cable) => [cable.id.toString(), cable]),
    );
    const utilityPolesMap = new Map(
      utilityPoles.map((utilityPole) => [
        utilityPole.id.toString(),
        utilityPole,
      ]),
    );
    return foundedPoints.map((point) => {
      return PointWithDetails.create({
        id: point.id,
        name: point.name,
        description: point.description,
        project,
        lowTensionEntranceCable: point.lowTensionEntranceCableId
          ? cablesMap.get(point.lowTensionEntranceCableId.toString())
          : undefined,
        lowTensionExitCable: point.lowTensionExitCableId
          ? cablesMap.get(point.lowTensionExitCableId.toString())
          : undefined,
        mediumTensionEntranceCable: point.mediumTensionEntranceCableId
          ? cablesMap.get(point.mediumTensionEntranceCableId.toString())
          : undefined,
        mediumTensionExitCable: point.mediumTensionExitCableId
          ? cablesMap.get(point.mediumTensionExitCableId.toString())
          : undefined,
        utilityPole: point.utilityPoleId
          ? utilityPolesMap.get(point.utilityPoleId.toString())
          : undefined,
      });
    });
  }
  async findByProjectIdAndNames(
    projectId: string,
    names: string[],
  ): Promise<Point[]> {
    const foundedPoints = this.items.filter(
      (item) =>
        item.projectId.toString() === projectId.toString() &&
        names.includes(item.name),
    );
    return foundedPoints;
  }
}
