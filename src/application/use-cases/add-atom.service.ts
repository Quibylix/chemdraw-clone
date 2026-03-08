import { ResultAsync, okAsync } from "neverthrow";
import { EntityId } from "../../domain/base/entity.base";
import { Atom } from "../../domain/entities/atom";
import { ChemicalElement } from "../../domain/value-objects/chemical-element";
import { ApplicationService } from "../base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";

export class AddAtomCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly symbol: string,
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
      const id = crypto.randomUUID();
      const element = new ChemicalElement({ symbol: command.symbol });

      return Atom.create(id, element)
        .asyncAndThen((atom) =>
          molecule.addAtom(atom).asyncAndThen(() => okAsync(molecule)),
        )
        .andThen(() => this.repository.save(molecule))
        .map(() => id);
    });
  }
}
