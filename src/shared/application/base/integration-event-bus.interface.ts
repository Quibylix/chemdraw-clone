export interface IntegrationEvent {
  readonly type: string;
  readonly eventId: string;
  readonly occurredOn: Date;
}

export type IntegrationEventHandlerFunction<T extends IntegrationEvent> = (
  event: T,
) => void;
export type IntegrationEventClass<T extends IntegrationEvent> = new (
  ...args: never[]
) => T;

export interface IntegrationEventBus {
  subscribe<T extends IntegrationEvent>(
    eventClass: IntegrationEventClass<T>,
    handler: IntegrationEventHandlerFunction<T>,
  ): void;
  publish(event: IntegrationEvent): void;
}
