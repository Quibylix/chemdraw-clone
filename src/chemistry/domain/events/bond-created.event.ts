import { DomainEvent } from "../../../shared/domain/base/domain-event";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { BondType } from "../entities/bond";

export class BondCreatedEvent implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
    public readonly bondType: BondType,
  ) {}
}
