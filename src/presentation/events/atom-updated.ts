import { PresentationEvent } from "../base/presentation-events";

export class AtomUpdated implements PresentationEvent {
  public readonly occurredOn: Date = new Date();

  constructor(public readonly atomId: string) {}
}
