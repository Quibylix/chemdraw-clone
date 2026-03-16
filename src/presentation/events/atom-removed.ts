import { PresentationEvent } from "../base/presentation-events";

export class AtomRemoved implements PresentationEvent {
  public readonly occurredOn: Date = new Date();

  constructor(public readonly atomId: string) {}
}
