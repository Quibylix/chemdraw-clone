import { IntegrationEvent } from "../../../shared/application/base/integration-event-bus.interface";
import { BondType } from "../../domain/entities/bond";

export class BondCreatedIntegration implements IntegrationEvent {
  readonly type = "BondCreated";
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly atomAId: string,
    public readonly atomBId: string,
    public readonly bondType: BondType,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
