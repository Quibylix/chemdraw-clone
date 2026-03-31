import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { AtomCreatedEvent } from "../../domain/events/atom-created.event";
import { AtomCreatedIntegration } from "../events/atom-created.integration";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";

export class AtomCreatedHandler implements DomainEventHandler<AtomCreatedEvent> {
  constructor(private integrationBus: IntegrationEventBus) {}

  handle(event: AtomCreatedEvent): void {
    const integrationEvent = new AtomCreatedIntegration(
      event.atomId,
      event.symbol,
      event.x,
      event.y,
    );
    this.integrationBus.publish(integrationEvent);
  }
}
