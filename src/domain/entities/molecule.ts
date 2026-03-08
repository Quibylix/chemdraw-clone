import { AggregateRoot } from "../base/aggregate-root.base";
import { EntityId } from "../base/entity.base";
import { Atom } from "./atom";
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

  public addAtom(atom: Atom): Result<void, Error> {
    if (this._atoms.has(atom.id)) {
      return err(
        new Error(`Atom with id ${atom.id} already exists in molecule`),
      );
    }

    this._atoms.set(atom.id, atom);
    return ok(undefined);
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
        (b.atoms[0].id === atomAId && b.atoms[1].id === atomBId) ||
        (b.atoms[0].id === atomBId && b.atoms[1].id === atomAId),
    );

    if (exists) {
      return err(new Error("A bond already exists between these atoms"));
    }

    const bondId = crypto.randomUUID();
    const bondResult = Bond.create(bondId, [atomA, atomB], type);

    if (bondResult.isErr()) {
      return err(bondResult.error);
    }

    const bond = bondResult.value;
    this._bonds.push(bond);

    return ok(bond);
  }
}
