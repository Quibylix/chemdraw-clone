import {
  CreateAtomCommand,
  CreateAtomService,
} from "../../chemistry/application/use-cases/create-atom.service";
import { EntityId } from "../../shared/domain/base/entity.base";
import { Scene } from "../scene";
import { Tool } from "./tool";

export class DrawTool implements Tool {
  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private service: CreateAtomService,
    private scene: Scene,
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

    const command = new CreateAtomCommand(this.moleculeId, "C", x, y);
    await this.service.execute(command).map((atomDto) => {
      this.scene.atoms.value = [...this.scene.atoms.value, atomDto];
    });
  }
}
