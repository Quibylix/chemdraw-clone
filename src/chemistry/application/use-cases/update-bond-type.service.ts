import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { BondType } from "../../domain/entities/bond";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { DomainEventBus } from "../../../shared/domain/base/domain-event-bus.interface";

export class UpdateBondTypeCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
    public readonly newType: BondType,
  ) {}
}

export class UpdateBondTypeService implements ApplicationService<
  UpdateBondTypeCommand,
  void
> {
  constructor(
    private repository: MoleculeRepository,
    private domainEventBus: DomainEventBus,
  ) {}

  public execute(command: UpdateBondTypeCommand): ResultAsync<void, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .updateBondType(command.atomAId, command.atomBId, command.newType)
        .asyncAndThen(() =>
          this.repository.save(molecule).map(() => {
            this.domainEventBus.publishEventsFromAggregate(molecule);
          }),
        );
    });
  }
}
