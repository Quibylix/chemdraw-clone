import {
  AddAtomCommand,
  AddAtomService,
} from "../../application/use-cases/add-atom.service";
import { EntityId } from "../../domain/base/entity.base";
import { PresentationEvents } from "../base/presentation-events";
import { AtomAdded } from "../events/atom-added";
import { Tool } from "./tool";

export class DrawTool implements Tool {
  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private service: AddAtomService,
  ) {
    this.handleClick = this.handleClick.bind(this);
  }

  activate() {
    this.canvas.addEventListener("click", this.handleClick);
  }

  deactivate() {
    this.canvas.removeEventListener("click", this.handleClick);
  }

  private async handleClick(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const command = new AddAtomCommand(this.moleculeId, "C", x, y);
    await this.service
      .execute(command)
      .map((atomId) =>
        PresentationEvents.dispatch(new AtomAdded(atomId, x, y)),
      );
  }
}
