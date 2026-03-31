import { IntegrationEvent } from "../../../shared/application/base/integration-event-bus.interface";
import { BondType } from "../../domain/entities/bond";

export class BondUpdatedIntegration implements IntegrationEvent {
  readonly type = "BondUpdated";
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly atomAId: string,
    public readonly atomBId: string,
    public readonly newBondType: BondType,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
