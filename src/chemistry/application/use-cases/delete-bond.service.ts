import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { DomainEventBus } from "../../../shared/domain/base/domain-event-bus.interface";

export class DeleteBondCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
  ) {}
}

export class DeleteBondService implements ApplicationService<
  DeleteBondCommand,
  void
> {
  constructor(
    private repository: MoleculeRepository,
    private domainEventBus: DomainEventBus,
  ) {}

  public execute(command: DeleteBondCommand): ResultAsync<void, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .removeBond(command.atomAId, command.atomBId)
        .asyncAndThen(() =>
          this.repository.save(molecule).map(() => {
            this.domainEventBus.publishEventsFromAggregate(molecule);
          }),
        );
    });
  }
}
