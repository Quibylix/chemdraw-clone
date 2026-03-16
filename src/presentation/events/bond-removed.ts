import { PresentationEvent } from "../base/presentation-events";

export class BondRemoved implements PresentationEvent {
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly atomAId: string,
    public readonly atomBId: string,
  ) {}
}
