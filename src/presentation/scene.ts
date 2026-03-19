import { BondType } from "../chemistry/domain/entities/bond";
import { EntityId } from "../shared/domain/base/entity.base";
import { signal, Signal } from "@preact/signals";

export type AtomDTO = {
  id: string;
  symbol: string;
  x: number;
  y: number;
};

export type BondDTO = {
  atomAId: string;
  atomBId: string;
  type: BondType;
};

export class Scene {
  public atoms: Signal<AtomDTO[]> = signal([]);
  public bonds: Signal<BondDTO[]> = signal([]);
  public hoveredAtomId: Signal<EntityId | null> = signal(null);
  public hoveredBondAtomIds: Signal<[EntityId, EntityId] | null> = signal(null);

  public insertAtom(atom: AtomDTO) {
    this.atoms.value = [...this.atoms.value, atom];
  }

  public clear(): void {
    this.atoms.value = [];
    this.bonds.value = [];
    this.hoveredAtomId.value = null;
    this.hoveredBondAtomIds.value = null;
  }
}
