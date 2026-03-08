import { EntityId } from "../domain/base/entity.base";
import { ScreenPoint } from "./screen-point";

export class Scene {
  private atomPositions: Map<EntityId, ScreenPoint> = new Map();
  private _hoveredAtomId: EntityId | null = null;

  public get hoveredAtomId(): EntityId | null {
    return this._hoveredAtomId;
  }

  public set hoveredAtomId(id: EntityId | null) {
    this._hoveredAtomId = id;
  }

  public addAtom(id: EntityId, position: ScreenPoint): void {
    this.atomPositions.set(id, position);
  }

  public getPosition(id: EntityId): ScreenPoint | undefined {
    return this.atomPositions.get(id);
  }

  public findAtomAt(point: ScreenPoint, radius: number = 20): EntityId | null {
    for (const [id, pos] of this.atomPositions.entries()) {
      const distance = Math.sqrt(
        Math.pow(pos.x - point.x, 2) + Math.pow(pos.y - point.y, 2),
      );
      if (distance <= radius) {
        return id;
      }
    }
    return null;
  }

  public clear(): void {
    this.atomPositions.clear();
    this._hoveredAtomId = null;
  }
}
