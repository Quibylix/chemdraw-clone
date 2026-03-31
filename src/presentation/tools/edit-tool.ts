import {
  UpdateAtomCommand,
  UpdateAtomService,
} from "../../chemistry/application/use-cases/update-atom.service";
import {
  UpdateBondTypeCommand,
  UpdateBondTypeService,
} from "../../chemistry/application/use-cases/update-bond-type.service";
import { EntityId } from "../../shared/domain/base/entity.base";
import { BondType } from "../../chemistry/domain/entities/bond";
import {
  ElementSymbol,
  ELEMENTS,
} from "../../chemistry/domain/value-objects/elements";
import {
  AtomOrBondDTO,
  GetAtomOrBondAtQuery,
  GetAtomOrBondAtService,
} from "../../chemistry/application/use-cases/get-atom-or-bond-at.service";
import { Scene } from "../scene";
import { Tool } from "./tool";

export class EditTool implements Tool {
  private inputBuffer: string = "";
  private hoveredItem: AtomOrBondDTO | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private updateAtomService: UpdateAtomService,
    private updateBondTypeService: UpdateBondTypeService,
    private getAtomOrBondAtService: GetAtomOrBondAtService,
    private scene: Scene,
  ) {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  activate() {
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("click", this.handleClick);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  deactivate() {
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.inputBuffer = "";
    this.hoveredItem = null;
    this.scene.hoveredAtomId.value = null;
    this.scene.hoveredBondAtomIds.value = null;
  }

  private async handleMouseMove(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const item = await this.getAtomOrBondAtService
      .execute(new GetAtomOrBondAtQuery(this.moleculeId, x, y))
      .unwrapOr(null);

    if (!this.hasHoverChanged(item)) {
      return;
    }

    this.inputBuffer = "";
    this.hoveredItem = item;

    if (!item) {
      this.scene.hoveredAtomId.value = null;
      this.scene.hoveredBondAtomIds.value = null;
    } else if (item.type === "atom") {
      this.scene.hoveredAtomId.value = item.atomId;
      this.scene.hoveredBondAtomIds.value = null;
    } else {
      this.scene.hoveredAtomId.value = null;
      this.scene.hoveredBondAtomIds.value = item.atomIds;
    }
  }

  private hasHoverChanged(newItem: AtomOrBondDTO | null): boolean {
    if (this.hoveredItem === null && newItem === null) return false;
    if (this.hoveredItem === null || newItem === null) return true;
    if (this.hoveredItem.type !== newItem.type) return true;

    if (this.hoveredItem.type === "atom" && newItem.type === "atom") {
      return this.hoveredItem.atomId !== newItem.atomId;
    }

    if (this.hoveredItem.type === "bond" && newItem.type === "bond") {
      return (
        this.hoveredItem.atomIds[0] !== newItem.atomIds[0] ||
        this.hoveredItem.atomIds[1] !== newItem.atomIds[1]
      );
    }

    return true;
  }

  private async handleClick(): Promise<void> {
    if (!this.hoveredItem || this.hoveredItem.type !== "bond") return;

    const bond = this.hoveredItem;
    const nextType = this.getNextBondType(bond.bondType);

    const command = new UpdateBondTypeCommand(
      this.moleculeId,
      bond.atomIds[0],
      bond.atomIds[1],
      nextType,
    );

    await this.updateBondTypeService.execute(command);
  }

  private getNextBondType(current: BondType): BondType {
    switch (current) {
      case BondType.Single:
        return BondType.Double;
      case BondType.Double:
        return BondType.Triple;
      case BondType.Triple:
        return BondType.Single;
    }
  }

  private async handleKeyDown(event: KeyboardEvent): Promise<void> {
    if (!this.hoveredItem || this.hoveredItem.type !== "atom") return;

    if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
      this.inputBuffer += event.key.toUpperCase();
      await this.updateAtomElement();
      event.preventDefault();
    } else if (event.key === "Backspace") {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      await this.updateAtomElement();
      event.preventDefault();
    }
  }

  private async updateAtomElement(): Promise<void> {
    if (!this.hoveredItem || this.hoveredItem.type !== "atom") return;
    if (this.inputBuffer.length === 0) return;

    const matchedSymbol = this.findMatchingElement(this.inputBuffer);

    if (!matchedSymbol) return;

    const atomId = this.hoveredItem.atomId;

    const command = new UpdateAtomCommand(
      this.moleculeId,
      atomId,
      matchedSymbol,
    );

    await this.updateAtomService.execute(command);
  }

  private findMatchingElement(buffer: string): ElementSymbol | null {
    const matches = (Object.keys(ELEMENTS) as ElementSymbol[]).filter(
      (symbol) => symbol.toUpperCase().startsWith(buffer.toUpperCase()),
    );

    if (matches.length === 0) return null;

    matches.sort((a, b) => a.length - b.length);
    return matches[0];
  }
}
