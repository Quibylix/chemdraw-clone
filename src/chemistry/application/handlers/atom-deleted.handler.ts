import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { AtomDeletedEvent } from "../../domain/events/atom-deleted.event";
import { AtomDeletedIntegration } from "../events/atom-deleted.integration";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";

export class AtomDeletedHandler implements DomainEventHandler {
  constructor(private integrationBus: IntegrationEventBus) {}

  handle(event: AtomDeletedEvent): void {
    const integrationEvent = new AtomDeletedIntegration(event.atomId);
    this.integrationBus.publish(integrationEvent);
  }
}
