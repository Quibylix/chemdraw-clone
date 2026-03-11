import { ResultAsync, okAsync } from "neverthrow";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { EntityId } from "../../domain/base/entity.base";

export class FindAtomAtQuery {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly x: number,
    public readonly y: number,
    public readonly radius: number = 20,
  ) {}
}

export class FindAtomAtService {
  constructor(private repository: MoleculeRepository) {}

  public execute(query: FindAtomAtQuery): ResultAsync<EntityId | null, Error> {
    return this.repository.findById(query.moleculeId).andThen((molecule) => {
      const foundAtom = molecule.findAtomAt(query.x, query.y, query.radius);
      return okAsync(foundAtom ? foundAtom.id : null);
    });
  }
}
