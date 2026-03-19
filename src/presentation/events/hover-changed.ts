import { EntityId } from "../../shared/domain/base/entity.base";
import { PresentationEvent } from "../base/presentation-events";

export type HoverTarget =
  | { type: "atom"; atomId: EntityId }
  | { type: "bond"; atomIds: [EntityId, EntityId] }
  | null;

export class HoverChanged implements PresentationEvent {
  public readonly occurredOn: Date = new Date();
  constructor(public readonly target: HoverTarget) {}

  get atomId(): EntityId | null {
    return this.target?.type === "atom" ? this.target.atomId : null;
  }

  get bondAtomIds(): [EntityId, EntityId] | null {
    return this.target?.type === "bond" ? this.target.atomIds : null;
  }
}
