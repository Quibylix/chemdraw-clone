import {
  DeleteAtomCommand,
  DeleteAtomService,
} from "../../application/use-cases/delete-atom.service";
import { EntityId } from "../../domain/base/entity.base";
import {
  FindAtomAtQuery,
  FindAtomAtService,
} from "../../application/use-cases/find-atom-at.service";
import { PresentationEvents } from "../base/presentation-events";
import { AtomRemoved } from "../events/atom-removed";
import { HoverChanged } from "../events/hover-changed";
import { Scene } from "../scene";
import { Tool } from "./tool";

export class DeleteTool implements Tool {
  constructor(
    private canvas: HTMLCanvasElement,
    private scene: Scene,
    private moleculeId: EntityId,
    private deleteAtomService: DeleteAtomService,
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
    this.scene.hoveredAtomId = null;
    PresentationEvents.dispatch(new HoverChanged(null));
  }

  private async handleMouseMove(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const atomId = await this.findAtomService
      .execute(new FindAtomAtQuery(this.moleculeId, x, y))
      .unwrapOr(null);

    if (this.scene.hoveredAtomId !== atomId) {
      this.scene.hoveredAtomId = atomId;
      PresentationEvents.dispatch(new HoverChanged(atomId));
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

    const command = new DeleteAtomCommand(this.moleculeId, atomId);
    await this.deleteAtomService
      .execute(command)
      .map(() => PresentationEvents.dispatch(new AtomRemoved(atomId)));
  }
}
