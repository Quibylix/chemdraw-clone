import { ResultAsync, okAsync } from "neverthrow";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { BondType } from "../../domain/entities/bond";

export type AtomOrBondDTO =
  | { type: "atom"; atomId: EntityId }
  | { type: "bond"; atomIds: [EntityId, EntityId]; bondType: BondType };

export class GetAtomOrBondAtQuery {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly x: number,
    public readonly y: number,
    public readonly atomRadius: number = 20,
    public readonly bondThreshold: number = 10,
  ) {}
}

export class GetAtomOrBondAtService {
  constructor(private repository: MoleculeRepository) {}

  public execute(
    query: GetAtomOrBondAtQuery,
  ): ResultAsync<AtomOrBondDTO | null, Error> {
    return this.repository.findById(query.moleculeId).andThen((molecule) => {
      const result = molecule.getAtomOrBondAt(
        query.x,
        query.y,
        query.atomRadius,
        query.bondThreshold,
      );

      if (!result) {
        return okAsync(null);
      }

      if (result.type === "atom") {
        return okAsync({
          type: "atom" as const,
          atomId: result.item.id,
        });
      }

      return okAsync({
        type: "bond" as const,
        atomIds: result.item.atomIds,
        bondType: result.item.type,
      });
    });
  }
}
