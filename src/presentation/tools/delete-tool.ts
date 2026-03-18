import {
  DeleteAtomCommand,
  DeleteAtomService,
} from "../../application/use-cases/delete-atom.service";
import {
  DeleteBondCommand,
  DeleteBondService,
} from "../../application/use-cases/delete-bond.service";
import { EntityId } from "../../domain/base/entity.base";
import {
  AtomOrBondDTO,
  GetAtomOrBondAtQuery,
  GetAtomOrBondAtService,
} from "../../application/use-cases/get-atom-or-bond-at.service";
import { PresentationEvents } from "../base/presentation-events";
import { AtomRemoved } from "../events/atom-removed";
import { BondRemoved } from "../events/bond-removed";
import { HoverChanged, HoverTarget } from "../events/hover-changed";
import { Tool } from "./tool";

export class DeleteTool implements Tool {
  private hoveredItem: AtomOrBondDTO | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private deleteAtomService: DeleteAtomService,
    private deleteBondService: DeleteBondService,
    private getAtomOrBondAtService: GetAtomOrBondAtService,
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
    PresentationEvents.dispatch(new HoverChanged(null));
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
    PresentationEvents.dispatch(new HoverChanged(this.toHoverTarget(item)));
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

  private toHoverTarget(item: AtomOrBondDTO | null): HoverTarget {
    if (!item) return null;
    if (item.type === "atom") {
      return { type: "atom", atomId: item.atomId };
    }
    return { type: "bond", atomIds: item.atomIds };
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
      await this.deleteAtomService.execute(command).map(() => {
        PresentationEvents.dispatch(new AtomRemoved(item.atomId));
      });
    } else {
      const command = new DeleteBondCommand(
        this.moleculeId,
        item.atomIds[0],
        item.atomIds[1],
      );
      await this.deleteBondService.execute(command).map(() => {
        PresentationEvents.dispatch(
          new BondRemoved(item.atomIds[0], item.atomIds[1]),
        );
      });
    }
  }
}
