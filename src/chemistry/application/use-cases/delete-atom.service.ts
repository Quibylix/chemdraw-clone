import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { DomainEventBus } from "../../../shared/domain/base/domain-event-bus.interface";

export class DeleteAtomCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomId: EntityId,
  ) {}
}

export class DeleteAtomService implements ApplicationService<
  DeleteAtomCommand,
  void
> {
  constructor(
    private repository: MoleculeRepository,
    private domainEventBus: DomainEventBus,
  ) {}

  public execute(command: DeleteAtomCommand): ResultAsync<void, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule.removeAtom(command.atomId).asyncAndThen(() =>
        this.repository.save(molecule).map(() => {
          this.domainEventBus.publishEventsFromAggregate(molecule);
        }),
      );
    });
  }
}
