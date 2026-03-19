import { EntityId } from "../../shared/domain/base/entity.base";
import {
  CreateBondCommand,
  CreateBondService,
} from "../../chemistry/application/use-cases/create-bond.service";
import { Tool } from "./tool";
import {
  FindAtomAtQuery,
  FindAtomAtService,
} from "../../chemistry/application/use-cases/find-atom-at.service";
import { Scene } from "../scene";

export class BondTool implements Tool {
  private firstSelectedAtomId: EntityId | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private moleculeId: EntityId,
    private bondService: CreateBondService,
    private findAtomService: FindAtomAtService,
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
    this.firstSelectedAtomId = null;

    this.scene.hoveredAtomId.value = null;
    this.scene.hoveredBondAtomIds.value = null;
  }

  private async handleMouseMove(event: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const atomId = await this.findAtomService
      .execute(new FindAtomAtQuery(this.moleculeId, x, y))
      .unwrapOr(null);

    if (this.scene.hoveredAtomId.value !== atomId) {
      this.scene.hoveredAtomId.value = atomId;
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

    await this.bondService.execute(command).map((bond) => {
      this.scene.bonds.value = [...this.scene.bonds.value, bond];
    });
    this.firstSelectedAtomId = null;
  }
}
