import { ResultAsync } from "neverthrow";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { EntityId } from "../../domain/base/entity.base";
import { BondType } from "../../domain/entities/bond";

export interface AtomDTO {
  id: string;
  symbol: string;
  x: number;
  y: number;
}

export interface BondDTO {
  atomAId: string;
  atomBId: string;
  type: BondType;
}

export interface MoleculeDTO {
  id: string;
  atoms: AtomDTO[];
  bonds: BondDTO[];
}

export class GetMoleculeQuery {
  constructor(public readonly moleculeId: EntityId) {}
}

export class GetMoleculeService {
  constructor(private repository: MoleculeRepository) {}

  public execute(query: GetMoleculeQuery): ResultAsync<MoleculeDTO, Error> {
    return this.repository.findById(query.moleculeId).map((molecule) => {
      const atoms: AtomDTO[] = Array.from(molecule.atoms.values()).map(
        (atom) => ({
          id: atom.id,
          symbol: atom.element.symbol,
          x: atom.x,
          y: atom.y,
        }),
      );

      const bonds: BondDTO[] = molecule.bonds.map((bond) => ({
        atomAId: bond.atomIds[0],
        atomBId: bond.atomIds[1],
        type: bond.type,
      }));

      return {
        id: molecule.id,
        atoms,
        bonds,
      };
    });
  }
}
