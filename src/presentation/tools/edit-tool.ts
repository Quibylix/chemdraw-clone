import {
  UpdateAtomCommand,
  UpdateAtomService,
} from "../../application/use-cases/update-atom.service";
import { EntityId } from "../../domain/base/entity.base";
import { ElementSymbol, ELEMENTS } from "../../domain/value-objects/elements";
import {
  FindAtomAtQuery,
  FindAtomAtService,
} from "../../application/use-cases/find-atom-at.service";
import { PresentationEvents } from "../base/presentation-events";
import { AtomUpdated } from "../events/atom-updated";
import { HoverChanged } from "../events/hover-changed";
import { Tool } from "./tool";

export class EditTool implements Tool {
  private inputBuffer: string = "";
  private hoveredAtomId: EntityId | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private updateAtomService: UpdateAtomService,
    private findAtomService: FindAtomAtService,
  ) {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  activate() {
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  deactivate() {
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.inputBuffer = "";
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
      this.inputBuffer = "";
      PresentationEvents.dispatch(new HoverChanged(atomId));
    }
  }

  private async handleKeyDown(event: KeyboardEvent): Promise<void> {
    if (!this.hoveredAtomId) return;

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
    if (!this.hoveredAtomId) return;
    if (this.inputBuffer.length === 0) return;

    const matchedSymbol = this.findMatchingElement(this.inputBuffer);

    if (!matchedSymbol) return;

    const command = new UpdateAtomCommand(
      this.moleculeId,
      this.hoveredAtomId,
      matchedSymbol,
    );

    await this.updateAtomService.execute(command).map(() => {
      if (this.hoveredAtomId) {
        PresentationEvents.dispatch(new AtomUpdated(this.hoveredAtomId));
      }
    });
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
