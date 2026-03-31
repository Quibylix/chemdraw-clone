import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { BondCreatedEvent } from "../../domain/events/bond-created.event";
import { BondCreatedIntegration } from "../events/bond-created.integration";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";

export class BondCreatedHandler implements DomainEventHandler {
  constructor(private integrationBus: IntegrationEventBus) {}

  handle(event: BondCreatedEvent): void {
    const integrationEvent = new BondCreatedIntegration(
      event.atomAId,
      event.atomBId,
      event.bondType,
    );
    this.integrationBus.publish(integrationEvent);
  }
}
