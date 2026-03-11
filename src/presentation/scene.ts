import { EntityId } from "../domain/base/entity.base";

export class Scene {
  public hoveredAtomId: EntityId | null = null;

  public clear(): void {
    this.hoveredAtomId = null;
  }
}
