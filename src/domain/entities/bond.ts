import { Entity, EntityId } from "../base/entity.base";
import { Atom } from "./atom";
import { Result, ok, err } from "neverthrow";

export enum BondType {
  Single,
  Double,
  Triple,
}

export class Bond extends Entity {
  private constructor(
    id: EntityId,
    public readonly atoms: [Atom, Atom],
    public readonly type: BondType,
  ) {
    super(id);
  }

  public static create(
    id: EntityId,
    atoms: [Atom, Atom],
    type: BondType = BondType.Single,
  ): Result<Bond, Error> {
    if (atoms[0].equals(atoms[1])) {
      return err(new Error("A bond cannot connect an atom to itself"));
    }
    return ok(new Bond(id, atoms, type));
  }
}
