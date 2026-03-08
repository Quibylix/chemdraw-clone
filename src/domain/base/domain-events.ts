import { DomainEvent } from "./domain-event";

export type DomainEventHandler<T extends DomainEvent> = (event: T) => void;

export type DomainEventClass<T extends DomainEvent> = abstract new (
  ...args: never[]
) => T;

export class DomainEvents {
  private static handlers: Map<
    DomainEventClass<DomainEvent>,
    DomainEventHandler<DomainEvent>[]
  > = new Map();

  public static subscribe<T extends DomainEvent>(
    eventClass: DomainEventClass<T>,
    handler: DomainEventHandler<T>,
  ): void {
    const key = eventClass;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }

    this.handlers.get(key)!.push(handler as DomainEventHandler<DomainEvent>);
  }

  public static dispatch(event: DomainEvent): void {
    const key = event.constructor as DomainEventClass<DomainEvent>;
    const handlers = this.handlers.get(key);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  public static clearHandlers(): void {
    this.handlers.clear();
  }
}
