import { IntegrationEvent } from "../../../shared/application/base/integration-event-bus.interface";

export class BondDeletedIntegration implements IntegrationEvent {
  readonly type = "BondDeleted";
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly atomAId: string,
    public readonly atomBId: string,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
