import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { Molecule } from "../../domain/entities/molecule";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { ApplicationService } from "../../../shared/application/base/application-service.base";

export class CreateMoleculeService implements ApplicationService<
  void,
  EntityId
> {
  constructor(private repository: MoleculeRepository) {}

  public execute(): ResultAsync<EntityId, Error> {
    const id = crypto.randomUUID();
    return Molecule.create(id).asyncAndThen((molecule) =>
      this.repository.save(molecule).map(() => molecule.id),
    );
  }
}
