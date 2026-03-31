import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { ElementSymbol } from "../../domain/value-objects/elements";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { DomainEventBus } from "../../../shared/domain/base/domain-event-bus.interface";

export class UpdateAtomCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomId: EntityId,
    public readonly elementSymbol: ElementSymbol,
  ) {}
}

export class UpdateAtomService implements ApplicationService<
  UpdateAtomCommand,
  void
> {
  constructor(
    private repository: MoleculeRepository,
    private domainEventBus: DomainEventBus,
  ) {}

  public execute(command: UpdateAtomCommand): ResultAsync<void, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .updateAtomElement(command.atomId, command.elementSymbol)
        .asyncAndThen(() =>
          this.repository.save(molecule).map(() => {
            this.domainEventBus.publishEventsFromAggregate(molecule);
          }),
        );
    });
  }
}
