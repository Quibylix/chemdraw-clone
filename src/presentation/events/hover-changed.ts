import { EntityId } from "../../domain/base/entity.base";
import { PresentationEvent } from "../base/presentation-events";

export class HoverChanged implements PresentationEvent {
  public readonly occurredOn: Date = new Date();
  constructor(public readonly atomId: EntityId | null) {}
}
