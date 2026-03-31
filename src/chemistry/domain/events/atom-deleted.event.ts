import { DomainEvent } from "../../../shared/domain/base/domain-event";
import { EntityId } from "../../../shared/domain/base/entity.base";

export class AtomDeletedEvent implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomId: EntityId,
  ) {}
}
