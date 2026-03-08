export interface PresentationEvent {
  readonly occurredOn: Date;
}

export type PresentationEventHandler<T extends PresentationEvent> = (
  event: T,
) => void;
export type PresentationEventClass<T extends PresentationEvent> = abstract new (
  ...args: never[]
) => T;

export class PresentationEvents {
  private static handlers: Map<
    PresentationEventClass<PresentationEvent>,
    PresentationEventHandler<PresentationEvent>[]
  > = new Map();

  public static subscribe<T extends PresentationEvent>(
    eventClass: PresentationEventClass<T>,
    handler: PresentationEventHandler<T>,
  ): void {
    const key = eventClass;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers
      .get(key)!
      .push(handler as PresentationEventHandler<PresentationEvent>);
  }

  public static dispatch(event: PresentationEvent): void {
    const key = event.constructor as PresentationEventClass<PresentationEvent>;
    const handlers = this.handlers.get(key);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  public static clearHandlers(): void {
    this.handlers.clear();
  }
}
