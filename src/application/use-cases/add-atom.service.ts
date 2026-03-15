import { ResultAsync } from "neverthrow";
import { EntityId } from "../../domain/base/entity.base";
import { ApplicationService } from "../base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { ElementSymbol } from "../../domain/value-objects/elements";

export class AddAtomCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly symbol: ElementSymbol,
    public readonly x: number,
    public readonly y: number,
  ) {}
}

export class AddAtomService implements ApplicationService<
  AddAtomCommand,
  EntityId
> {
  constructor(private repository: MoleculeRepository) {}

  public execute(command: AddAtomCommand): ResultAsync<EntityId, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .addAtom(command.symbol, command.x, command.y)
        .asyncAndThen((atom) =>
          this.repository.save(molecule).map(() => atom.id),
        );
    });
  }
}
