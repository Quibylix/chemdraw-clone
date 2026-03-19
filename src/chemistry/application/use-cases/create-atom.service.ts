import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { ElementSymbol } from "../../domain/value-objects/elements";

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
  EntityId
> {
  constructor(private repository: MoleculeRepository) {}

  public execute(command: CreateAtomCommand): ResultAsync<EntityId, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .addAtom(command.symbol, command.x, command.y)
        .asyncAndThen((atom) =>
          this.repository.save(molecule).map(() => atom.id),
        );
    });
  }
}
