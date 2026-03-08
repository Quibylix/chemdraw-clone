import { PresentationEvent } from "../base/presentation-events";

export class AtomAdded implements PresentationEvent {
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly atomId: string,
    public readonly x: number,
    public readonly y: number,
  ) {}
}
