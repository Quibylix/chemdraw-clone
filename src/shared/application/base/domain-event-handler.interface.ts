import { DomainEvent } from "../../../shared/domain/base/domain-event";

export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): void;
}
