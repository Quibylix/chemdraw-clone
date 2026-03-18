import { EntityId } from "../../domain/base/entity.base";
import {
  CreateBondCommand,
  CreateBondService,
} from "../../application/use-cases/create-bond.service";
import { Tool } from "./tool";
import { PresentationEvents } from "../base/presentation-events";
import { BondAdded } from "../events/bond-added";
import { HoverChanged } from "../events/hover-changed";
import {
  FindAtomAtQuery,
  FindAtomAtService,
} from "../../application/use-cases/find-atom-at.service";

export class BondTool implements Tool {
  private firstSelectedAtomId: EntityId | null = null;
  private hoveredAtomId: EntityId | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private bondService: CreateBondService,
    private findAtomService: FindAtomAtService,
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
    this.firstSelectedAtomId = null;
    this.hoveredAtomId = null;
    PresentationEvents.dispatch(new HoverChanged(null));
  }

  private async handleMouseMove(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const atomId = await this.findAtomService
      .execute(new FindAtomAtQuery(this.moleculeId, x, y))
      .unwrapOr(null);

    if (this.hoveredAtomId !== atomId) {
      this.hoveredAtomId = atomId;
      PresentationEvents.dispatch(
        new HoverChanged(atomId ? { type: "atom", atomId } : null),
      );
    }
  }

  private async handleClick(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const atomId = await this.findAtomService
      .execute(new FindAtomAtQuery(this.moleculeId, x, y))
      .unwrapOr(null);

    if (!atomId) return;

    if (!this.firstSelectedAtomId) {
      this.firstSelectedAtomId = atomId;
      return;
    }

    if (this.firstSelectedAtomId === atomId) {
      this.firstSelectedAtomId = null;
      return;
    }

    const command = new CreateBondCommand(
      this.moleculeId,
      this.firstSelectedAtomId,
      atomId,
    );

    const firstSelectedAtomId = this.firstSelectedAtomId;
    await this.bondService
      .execute(command)
      .map(() =>
        PresentationEvents.dispatch(new BondAdded(firstSelectedAtomId, atomId)),
      );
    this.firstSelectedAtomId = null;
  }
}
