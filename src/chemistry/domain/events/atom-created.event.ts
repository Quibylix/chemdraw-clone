import { DomainEvent } from "../../../shared/domain/base/domain-event";
import { EntityId } from "../../../shared/domain/base/entity.base";

export class AtomCreatedEvent implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomId: EntityId,
    public readonly symbol: string,
    public readonly x: number,
    public readonly y: number,
  ) {}
}
