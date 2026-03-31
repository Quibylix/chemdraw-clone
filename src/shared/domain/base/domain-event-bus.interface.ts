import { DomainEvent } from "./domain-event";
import { AggregateRoot } from "./aggregate-root.base";

export type DomainEventHandlerFunction<T extends DomainEvent> = (
  event: T,
) => void;
export type DomainEventClass<T extends DomainEvent> = abstract new (
  ...args: never[]
) => T;

export interface DomainEventBus {
  subscribe<T extends DomainEvent>(
    eventClass: DomainEventClass<T>,
    handler: DomainEventHandlerFunction<T>,
  ): void;
  publishEventsFromAggregate(aggregate: AggregateRoot): void;
}
