import { IntegrationEvent } from "../../../shared/application/base/integration-event-bus.interface";

export class AtomDeletedIntegration implements IntegrationEvent {
  readonly type = "AtomDeleted";
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(public readonly atomId: string) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
