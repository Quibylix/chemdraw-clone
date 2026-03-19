import { EntityId } from "../shared/domain/base/entity.base";

export class Scene {
  public hoveredAtomId: EntityId | null = null;
  public hoveredBondAtomIds: [EntityId, EntityId] | null = null;

  public clear(): void {
    this.hoveredAtomId = null;
    this.hoveredBondAtomIds = null;
  }
}
