import {
  DeleteAtomCommand,
  DeleteAtomService,
} from "../../chemistry/application/use-cases/delete-atom.service";
import {
  DeleteBondCommand,
  DeleteBondService,
} from "../../chemistry/application/use-cases/delete-bond.service";
import { EntityId } from "../../shared/domain/base/entity.base";
import {
  AtomOrBondDTO,
  GetAtomOrBondAtQuery,
  GetAtomOrBondAtService,
} from "../../chemistry/application/use-cases/get-atom-or-bond-at.service";
import { Scene } from "../scene";
import { Tool } from "./tool";

export class DeleteTool implements Tool {
  private hoveredItem: AtomOrBondDTO | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private deleteAtomService: DeleteAtomService,
    private deleteBondService: DeleteBondService,
    private getAtomOrBondAtService: GetAtomOrBondAtService,
    private scene: Scene,
  ) {
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  activate() {
    this.canvas.addEventListener("click", this.handleClick);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
  }

  deactivate() {
    this.canvas.removeEventListener("click", this.handleClick);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
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

  private async handleClick(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const item = await this.getAtomOrBondAtService
      .execute(new GetAtomOrBondAtQuery(this.moleculeId, x, y))
      .unwrapOr(null);

    if (!item) return;

    if (item.type === "atom") {
      const command = new DeleteAtomCommand(this.moleculeId, item.atomId);
      await this.deleteAtomService.execute(command);
    } else {
      const command = new DeleteBondCommand(
        this.moleculeId,
        item.atomIds[0],
        item.atomIds[1],
      );
      await this.deleteBondService.execute(command);
    }
  }
}
