import { IntegrationEvent } from "../../application/base/integration-event-bus.interface";
import { IntegrationEventHandlerFunction } from "../../application/base/integration-event-bus.interface";
import { IntegrationEventClass } from "../../application/base/integration-event-bus.interface";

export class InMemoryIntegrationEventBus {
  private handlers: Map<
    IntegrationEventClass<IntegrationEvent>,
    IntegrationEventHandlerFunction<IntegrationEvent>[]
  > = new Map();

  subscribe<T extends IntegrationEvent>(
    eventClass: IntegrationEventClass<T>,
    handler: IntegrationEventHandlerFunction<T>,
  ): void {
    if (!this.handlers.has(eventClass)) {
      this.handlers.set(eventClass, []);
    }

    const handlers = this.handlers.get(eventClass);

    if (!handlers) {
      throw new Error(
        `Failed to retrieve handlers for event class: ${eventClass.name}`,
      );
    }

    handlers.push(handler as IntegrationEventHandlerFunction<IntegrationEvent>);
  }

  publish<T extends IntegrationEvent>(event: T): void {
    const key = event.constructor as IntegrationEventClass<T>;
    this.handlers.get(key)?.forEach((handler) => handler(event));
  }
}
