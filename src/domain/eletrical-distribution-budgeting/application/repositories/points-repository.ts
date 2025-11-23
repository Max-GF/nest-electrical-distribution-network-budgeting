import { Point } from "../../enterprise/entities/point";
import { PointWithDetails } from "../../enterprise/entities/value-objects/point-with-details";

export abstract class PointsRepository {
  abstract createMany(points: Point[]): Promise<void>;
  abstract save(point: Point): Promise<void>;
  abstract findById(id: string): Promise<Point | null>;
  abstract findByNameAndProjectId(
    name: string,
    projectId: string,
  ): Promise<Point | null>;
  abstract findAllByProjectId(projectId: string): Promise<Point[]>;
  abstract findByProjectIdAndNames(
    projectId: string,
    names: string[],
  ): Promise<Point[]>;
  abstract findAllWithDetailsByProjectId(
    projectId: string,
  ): Promise<PointWithDetails[]>;
}
