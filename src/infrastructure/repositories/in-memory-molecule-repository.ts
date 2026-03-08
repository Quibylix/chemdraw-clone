import { ResultAsync, okAsync, errAsync } from "neverthrow";
import { Molecule } from "../../domain/entities/molecule";
import { EntityId } from "../../domain/base/entity.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";

export class InMemoryMoleculeRepository implements MoleculeRepository {
  private molecules: Map<EntityId, Molecule> = new Map();

  public findById(id: EntityId): ResultAsync<Molecule, Error> {
    const molecule = this.molecules.get(id);
    if (!molecule) {
      return errAsync(new Error(`Molecule with id ${id} not found`));
    }
    return okAsync(molecule);
  }

  public save(molecule: Molecule): ResultAsync<void, Error> {
    this.molecules.set(molecule.id, molecule);
    return okAsync(undefined);
  }
}
