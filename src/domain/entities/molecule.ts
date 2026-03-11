import { AggregateRoot } from "../base/aggregate-root.base";
import { EntityId } from "../base/entity.base";
import { Atom } from "./atom";
import { ChemicalElement } from "../value-objects/chemical-element";
import { Bond, BondType } from "./bond";
import { Result, ok, err } from "neverthrow";

export class Molecule extends AggregateRoot {
  private _atoms: Map<EntityId, Atom> = new Map();
  private _bonds: Bond[] = [];

  private constructor(id: EntityId) {
    super(id);
  }

  public static create(id: EntityId): Result<Molecule, Error> {
    if (!id) {
      return err(new Error("Molecule must have an ID"));
    }
    return ok(new Molecule(id));
  }

  get atoms(): ReadonlyMap<EntityId, Atom> {
    return this._atoms;
  }

  get bonds(): readonly Bond[] {
    return [...this._bonds];
  }

  public addAtom(symbol: string, x: number, y: number): Result<Atom, Error> {
    const element = new ChemicalElement({ symbol });
    const id = crypto.randomUUID();

    const atomResult = Atom.create(id, element, x, y);

    if (atomResult.isErr()) {
      return err(atomResult.error);
    }

    const atom = atomResult.value;
    this._atoms.set(atom.id, atom);

    return ok(atom);
  }

  public findAtomAt(x: number, y: number, radius: number = 20): Atom | null {
    for (const atom of this._atoms.values()) {
      const distance = Math.sqrt(
        Math.pow(atom.x - x, 2) + Math.pow(atom.y - y, 2),
      );
      if (distance <= radius) {
        return atom;
      }
    }
    return null;
  }

  public addBond(
    atomAId: EntityId,
    atomBId: EntityId,
    type: BondType = BondType.Single,
  ): Result<Bond, Error> {
    const atomA = this._atoms.get(atomAId);
    const atomB = this._atoms.get(atomBId);

    if (!atomA || !atomB) {
      return err(
        new Error("Both atoms must exist in the molecule to create a bond"),
      );
    }

    if (atomAId === atomBId) {
      return err(new Error("A bond cannot connect an atom to itself"));
    }

    const exists = this._bonds.some(
      (b) =>
        (b.atomIds[0] === atomAId && b.atomIds[1] === atomBId) ||
        (b.atomIds[0] === atomBId && b.atomIds[1] === atomAId),
    );

    if (exists) {
      return err(new Error("A bond already exists between these atoms"));
    }

    const bondResult = Bond.create([atomAId, atomBId], type);

    if (bondResult.isErr()) {
      return err(bondResult.error);
    }

    const bond = bondResult.value;
    this._bonds.push(bond);

    return ok(bond);
  }
}
