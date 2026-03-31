import { DomainEvent } from "../../../shared/domain/base/domain-event";
import { AggregateRoot } from "../../../shared/domain/base/aggregate-root.base";
import {
  DomainEventBus,
  DomainEventClass,
  DomainEventHandlerFunction,
} from "../../../shared/domain/base/domain-event-bus.interface";

export class InMemoryDomainEventBus implements DomainEventBus {
  private handlers: Map<
    DomainEventClass<DomainEvent>,
    DomainEventHandlerFunction<DomainEvent>[]
  > = new Map();

  subscribe<T extends DomainEvent>(
    eventClass: DomainEventClass<T>,
    handler: DomainEventHandlerFunction<T>,
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

    handlers.push(handler as DomainEventHandlerFunction<DomainEvent>);
  }

  publishEventsFromAggregate(aggregate: AggregateRoot): void {
    const events = aggregate.domainEvents;
    events.forEach((event) => {
      const key = event.constructor as DomainEventClass<DomainEvent>;
      this.handlers.get(key)?.forEach((handler) => handler(event));
    });
    aggregate.clearEvents();
  }
}
