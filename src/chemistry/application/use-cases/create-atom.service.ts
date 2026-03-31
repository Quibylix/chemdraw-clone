import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { ElementSymbol } from "../../domain/value-objects/elements";
import { DomainEventBus } from "../../../shared/domain/base/domain-event-bus.interface";

export type CreateAtomDTO = {
  id: EntityId;
  symbol: string;
  x: number;
  y: number;
};

export class CreateAtomCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly symbol: ElementSymbol,
    public readonly x: number,
    public readonly y: number,
  ) {}
}

export class CreateAtomService implements ApplicationService<
  CreateAtomCommand,
  CreateAtomDTO
> {
  constructor(
    private repository: MoleculeRepository,
    private domainEventBus: DomainEventBus,
  ) {}

  public execute(
    command: CreateAtomCommand,
  ): ResultAsync<CreateAtomDTO, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) =>
      molecule
        .addAtom(command.symbol, command.x, command.y)
        .asyncAndThen((atom) =>
          this.repository
            .save(molecule)
            .map(() => this.domainEventBus.publishEventsFromAggregate(molecule))
            .map(() => ({
              id: atom.id,
              symbol: atom.element.symbol,
              x: command.x,
              y: command.y,
            })),
        ),
    );
  }
}
