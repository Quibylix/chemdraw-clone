import { ResultAsync } from "neverthrow";
import { Molecule } from "../entities/molecule";
import { EntityId } from "../../../shared/domain/base/entity.base";

export interface MoleculeRepository {
  findById(id: EntityId): ResultAsync<Molecule, Error>;
  save(molecule: Molecule): ResultAsync<void, Error>;
}
