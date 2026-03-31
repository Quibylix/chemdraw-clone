import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { BondDeletedEvent } from "../../domain/events/bond-deleted.event";
import { BondDeletedIntegration } from "../events/bond-deleted.integration";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";

export class BondDeletedHandler implements DomainEventHandler {
  constructor(private integrationBus: IntegrationEventBus) {}

  handle(event: BondDeletedEvent): void {
    const integrationEvent = new BondDeletedIntegration(
      event.atomAId,
      event.atomBId,
    );
    this.integrationBus.publish(integrationEvent);
  }
}
