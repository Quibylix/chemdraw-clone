export type EntityId = string;

export abstract class Entity {
  protected constructor(public readonly id: EntityId) {}

  public equals(other?: Entity): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    return this.id === other.id;
  }
}
