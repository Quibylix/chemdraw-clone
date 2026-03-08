import { Entity, EntityId } from "../base/entity.base";
import { ChemicalElement } from "../value-objects/chemical-element";
import { Result, ok, err } from "neverthrow";

export class Atom extends Entity {
  private constructor(
    id: EntityId,
    public readonly element: ChemicalElement,
  ) {
    super(id);
  }

  public static create(
    id: EntityId,
    element: ChemicalElement,
  ): Result<Atom, Error> {
    if (!element.symbol) {
      return err(new Error("Atom must have a chemical symbol"));
    }

    return ok(new Atom(id, element));
  }
}
