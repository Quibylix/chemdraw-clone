import { DomainEvent } from "../../../shared/domain/base/domain-event";
import { EntityId } from "../../../shared/domain/base/entity.base";

export class BondDeletedEvent implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
  ) {}
}
