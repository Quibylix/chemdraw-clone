import { EntityId } from "../base/entity.base";
import { ValueObject } from "../base/value-object.base";
import { Result, ok, err } from "neverthrow";

export enum BondType {
  Single,
  Double,
  Triple,
}

export class Bond extends ValueObject<{
  atomIds: [EntityId, EntityId];
  type: BondType;
}> {
  private constructor(
    public readonly atomIds: [EntityId, EntityId],
    public readonly type: BondType,
  ) {
    super({ atomIds, type });
  }

  public static create(
    atoms: [EntityId, EntityId],
    type: BondType = BondType.Single,
  ): Result<Bond, Error> {
    const sortedAtomIds = [...atoms].sort() as [EntityId, EntityId];

    if (sortedAtomIds[0] === sortedAtomIds[1]) {
      return err(new Error("A bond cannot connect an atom to itself"));
    }

    return ok(new Bond(sortedAtomIds, type));
  }
}
