import { AggregateRoot } from "../base/aggregate-root.base";
import { EntityId } from "../base/entity.base";
import { Atom } from "./atom";
import { ChemicalElement } from "../value-objects/chemical-element";
import { Bond, BondType } from "./bond";
import { Result, ok, err } from "neverthrow";
import { ElementSymbol } from "../value-objects/elements";

export type AtomOrBondResult =
  | { type: "atom"; item: Atom }
  | { type: "bond"; item: Bond };

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

  public getAtomOrBondAt(
    x: number,
    y: number,
    atomRadius: number = 20,
    bondThreshold: number = 10,
  ): AtomOrBondResult | null {
    const atomCandidate = this.findClosestAtom(x, y, atomRadius);
    const bondCandidate = this.findClosestBond(x, y, bondThreshold);

    if (!atomCandidate && !bondCandidate) {
      return null;
    }

    if (atomCandidate && !bondCandidate) {
      return { type: "atom", item: atomCandidate.atom };
    }

    if (bondCandidate && !atomCandidate) {
      return { type: "bond", item: bondCandidate.bond };
    }

    // Atoms always take priority over bonds when within detection radius
    return { type: "atom", item: atomCandidate!.atom };
  }

  private findClosestAtom(
    x: number,
    y: number,
    radius: number,
  ): { atom: Atom; distance: number } | null {
    const candidates = [...this._atoms.values()]
      .map((atom) => ({
        atom,
        distance: Math.sqrt(Math.pow(atom.x - x, 2) + Math.pow(atom.y - y, 2)),
      }))
      .filter(({ distance }) => distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return candidates[0] || null;
  }

  private findClosestBond(
    x: number,
    y: number,
    threshold: number,
  ): { bond: Bond; distance: number } | null {
    const candidates = this.bonds
      .map((bond) => {
        const atomA = this._atoms.get(bond.atomIds[0]);
        const atomB = this._atoms.get(bond.atomIds[1]);

        if (!atomA || !atomB) return null;

        const distance = this.pointToSegmentDistance(
          x,
          y,
          atomA.x,
          atomA.y,
          atomB.x,
          atomB.y,
        );

        return { bond, distance };
      })
      .filter((c): c is { bond: Bond; distance: number } => c !== null)
      .filter(({ distance }) => distance <= threshold)
      .sort((a, b) => a.distance - b.distance);

    return candidates[0] || null;
  }

  private pointToSegmentDistance(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
  ): number {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;

    const abLengthSq = abx * abx + aby * aby;

    if (abLengthSq === 0) {
      return Math.sqrt(apx * apx + apy * apy);
    }

    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLengthSq));

    const closestX = ax + t * abx;
    const closestY = ay + t * aby;

    const dx = px - closestX;
    const dy = py - closestY;

    return Math.sqrt(dx * dx + dy * dy);
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

  public updateAtomElement(
    atomId: EntityId,
    symbol: ElementSymbol,
  ): Result<void, Error> {
    const atom = this._atoms.get(atomId);
    if (!atom) {
      return err(new Error("Atom not found in molecule"));
    }

    const elementResult = ChemicalElement.create(symbol);
    if (elementResult.isErr()) {
      return err(elementResult.error);
    }

    const element = elementResult.value;

    const updatedAtomResult = atom.updateElement(element);
    if (updatedAtomResult.isErr()) {
      return err(updatedAtomResult.error);
    }

    return ok();
  }

  public updateBondType(
    atomAId: EntityId,
    atomBId: EntityId,
    newType: BondType,
  ): Result<void, Error> {
    const atomA = this._atoms.get(atomAId);
    const atomB = this._atoms.get(atomBId);

    if (!atomA || !atomB) {
      return err(new Error("Both atoms must exist in the molecule"));
    }

    const existingBond = atomA.bonds.find(
      (b) => b.atomIds.includes(atomAId) && b.atomIds.includes(atomBId),
    );

    if (!existingBond) {
      return err(new Error("Bond does not exist between these atoms"));
    }

    const newBondResult = Bond.create([atomAId, atomBId], newType);
    if (newBondResult.isErr()) {
      return err(newBondResult.error);
    }

    const newBond = newBondResult.value;

    const removeAResult = atomA.removeBond(existingBond);
    if (removeAResult.isErr()) {
      return err(removeAResult.error);
    }

    const removeBResult = atomB.removeBond(existingBond);
    if (removeBResult.isErr()) {
      return err(removeBResult.error);
    }

    const addAResult = atomA.addBond(newBond);
    if (addAResult.isErr()) {
      return err(addAResult.error);
    }

    const addBResult = atomB.addBond(newBond);
    if (addBResult.isErr()) {
      return err(addBResult.error);
    }

    return ok();
  }
}
