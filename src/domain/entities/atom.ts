import { Entity, EntityId } from "../base/entity.base";
import { ChemicalElement } from "../value-objects/chemical-element";
import { Result, ok, err } from "neverthrow";
import { Bond } from "./bond";

export class Atom extends Entity {
  private _bonds: Bond[] = [];

  private constructor(
    id: EntityId,
    private _element: ChemicalElement,
    public readonly x: number,
    public readonly y: number,
  ) {
    super(id);
  }

  public get element(): ChemicalElement {
    return this._element;
  }

  public static create(
    id: EntityId,
    element: ChemicalElement,
    x: number,
    y: number,
  ): Result<Atom, Error> {
    if (!element.symbol) {
      return err(new Error("Atom must have a chemical symbol"));
    }

    return ok(new Atom(id, element, x, y));
  }

  public get bonds(): readonly Bond[] {
    return [...this._bonds];
  }

  public addBond(bond: Bond): Result<void, Error> {
    if (this._bonds.some((b) => b.equals(bond))) {
      return err(new Error("Bond already exists for this atom"));
    }

    if (!bond.atomIds.includes(this.id)) {
      return err(new Error("Bond must connect to this atom"));
    }

    this._bonds.push(bond);
    return ok(undefined);
  }

  public removeBond(bond: Bond): Result<void, Error> {
    const index = this._bonds.findIndex((b) => b.equals(bond));
    if (index === -1) {
      return err(new Error("Bond not found on this atom"));
    }

    this._bonds.splice(index, 1);
    return ok();
  }

  public updateElement(element: ChemicalElement): Result<void, Error> {
    this._element = element;

    return ok();
  }
}
