import { IntegrationEvent } from "../../../shared/application/base/integration-event-bus.interface";

export class AtomCreatedIntegration implements IntegrationEvent {
  readonly type = "AtomCreated";
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly atomId: string,
    public readonly symbol: string,
    public readonly x: number,
    public readonly y: number,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
