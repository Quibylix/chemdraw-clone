import { AggregateRoot } from "../base/aggregate-root.base";
import { EntityId } from "../base/entity.base";
import { Atom } from "./atom";
import { ChemicalElement } from "../value-objects/chemical-element";
import { Bond, BondType } from "./bond";
import { Result, ok, err } from "neverthrow";
import { ElementSymbol } from "../value-objects/elements";

export class Molecule extends AggregateRoot {
  private _atoms: Map<EntityId, Atom> = new Map();

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
    const bondsSet = new Set<Bond>();
    this._atoms.forEach((atom) => {
      atom.bonds.forEach((bond) => bondsSet.add(bond));
    });
    return Array.from(bondsSet);
  }

  public addAtom(
    symbol: ElementSymbol,
    x: number,
    y: number,
  ): Result<Atom, Error> {
    const elementResult = ChemicalElement.create(symbol);

    if (elementResult.isErr()) {
      return err(elementResult.error);
    }

    const element = elementResult.value;
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
    return (
      [...this._atoms.values()]
        .map((atom) => ({
          atom: atom,
          distance: Math.sqrt(
            Math.pow(atom.x - x, 2) + Math.pow(atom.y - y, 2),
          ),
        }))
        .filter(({ distance }) => distance <= radius)
        .sort((a, b) => a.distance - b.distance)[0]?.atom || null
    );
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

    const bondResult = Bond.create([atomAId, atomBId], type);

    if (bondResult.isErr()) {
      return err(bondResult.error);
    }

    const bond = bondResult.value;

    return atomA
      .addBond(bond)
      .andThen(() => atomB.addBond(bond))
      .map(() => bond);
  }

  public removeAtom(atomId: EntityId): Result<void, Error> {
    const atom = this._atoms.get(atomId);

    if (!atom) {
      return err(new Error("Atom not found in molecule"));
    }

    const bondsToRemove = atom.bonds;
    for (const bond of bondsToRemove) {
      const otherAtomId = bond.atomIds.find((id) => id !== atomId);

      if (!otherAtomId) {
        throw new Error("Invalid bond: does not connect to another atom");
      }

      const otherAtom = this._atoms.get(otherAtomId);
      if (!otherAtom) {
        throw new Error("Invalid bond: other atom not found in molecule");
      }

      const removeResult = otherAtom.removeBond(bond);
      if (removeResult.isErr()) {
        return err(removeResult.error);
      }
    }

    this._atoms.delete(atomId);
    return ok();
  }

  public removeBond(atomAId: EntityId, atomBId: EntityId): Result<void, Error> {
    const atomA = this._atoms.get(atomAId);
    const atomB = this._atoms.get(atomBId);

    if (!atomA || !atomB) {
      return err(new Error("Both atoms must exist in the molecule"));
    }

    const bond = atomA.bonds.find(
      (b) => b.atomIds.includes(atomAId) && b.atomIds.includes(atomBId),
    );

    if (!bond) {
      return err(new Error("Bond does not exist between these atoms"));
    }

    const resultA = atomA.removeBond(bond);
    if (resultA.isErr()) {
      return err(resultA.error);
    }

    const resultB = atomB.removeBond(bond);
    if (resultB.isErr()) {
      return err(resultB.error);
    }

    return ok();
  }
}
