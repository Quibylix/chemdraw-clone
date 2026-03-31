import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { AtomUpdatedEvent } from "../../domain/events/atom-updated.event";
import { AtomUpdatedIntegration } from "../events/atom-updated.integration";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";

export class AtomUpdatedHandler implements DomainEventHandler {
  constructor(private integrationBus: IntegrationEventBus) {}

  handle(event: AtomUpdatedEvent): void {
    const integrationEvent = new AtomUpdatedIntegration(
      event.atomId,
      event.newSymbol,
    );
    this.integrationBus.publish(integrationEvent);
  }
}
