import { PresentationEvent } from "../base/presentation-events";

export class BondAdded implements PresentationEvent {
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly atomId1: string,
    public readonly atomId2: string,
  ) {}
}
