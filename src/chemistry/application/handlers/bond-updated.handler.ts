import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { BondUpdatedEvent } from "../../domain/events/bond-updated.event";
import { BondUpdatedIntegration } from "../events/bond-updated.integration";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";

export class BondUpdatedHandler implements DomainEventHandler {
  constructor(private integrationBus: IntegrationEventBus) {}

  handle(event: BondUpdatedEvent): void {
    const integrationEvent = new BondUpdatedIntegration(
      event.atomAId,
      event.atomBId,
      event.newBondType,
    );
    this.integrationBus.publish(integrationEvent);
  }
}
