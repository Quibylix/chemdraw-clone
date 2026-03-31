import { DomainEvent } from "../../../shared/domain/base/domain-event";
import { EntityId } from "../../../shared/domain/base/entity.base";

export class AtomUpdatedEvent implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomId: EntityId,
    public readonly oldSymbol: string,
    public readonly newSymbol: string,
  ) {}
}
