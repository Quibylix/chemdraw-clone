import { EntityId } from "../../domain/base/entity.base";
import {
  CreateBondCommand,
  CreateBondService,
} from "../../application/use-cases/create-bond.service";
import { Scene } from "../scene";
import { Tool } from "./tool";
import { PresentationEvents } from "../base/presentation-events";
import { BondAdded } from "../events/bond-added";
import { HoverChanged } from "../events/hover-changed";

export class BondTool implements Tool {
  private firstSelectedAtomId: EntityId | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private scene: Scene,
    private moleculeId: EntityId,
    private service: CreateBondService,
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
    this.scene.hoveredAtomId = null;
    PresentationEvents.dispatch(new HoverChanged(null));
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const atomId = this.scene.findAtomAt(point);

    if (this.scene.hoveredAtomId !== atomId) {
      this.scene.hoveredAtomId = atomId;
      PresentationEvents.dispatch(new HoverChanged(atomId));
    }
  }

  private async handleClick(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const atomId = this.scene.findAtomAt(point);

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
    await this.service
      .execute(command)
      .map(() =>
        PresentationEvents.dispatch(new BondAdded(firstSelectedAtomId, atomId)),
      );
    this.firstSelectedAtomId = null;
  }
}
