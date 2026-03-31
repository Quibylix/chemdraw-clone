import { CanvasRenderer } from "./canvas-renderer";
import { Scene } from "./scene";
import { Tool } from "./tools/tool";
import { DrawTool } from "./tools/draw-tool";
import { BondTool } from "./tools/bond-tool";
import { DeleteTool } from "./tools/delete-tool";
import { EditTool } from "./tools/edit-tool";
import { CreateMoleculeService } from "../chemistry/application/use-cases/create-molecule.service";
import { CreateAtomService } from "../chemistry/application/use-cases/create-atom.service";
import { CreateBondService } from "../chemistry/application/use-cases/create-bond.service";
import { DeleteAtomService } from "../chemistry/application/use-cases/delete-atom.service";
import { DeleteBondService } from "../chemistry/application/use-cases/delete-bond.service";
import { UpdateAtomService } from "../chemistry/application/use-cases/update-atom.service";
import { UpdateBondTypeService } from "../chemistry/application/use-cases/update-bond-type.service";
import { GetAtomOrBondAtService } from "../chemistry/application/use-cases/get-atom-or-bond-at.service";
import { AtomDTO } from "../chemistry/application/use-cases/get-molecule.service";
import { FindAtomAtService } from "../chemistry/application/use-cases/find-atom-at.service";
import { effect, signal } from "@preact/signals";

const availableTools = {
  atom: "🟢 Atom",
  bond: "🔗 Bond",
  edit: "✏️ Edit",
  delete: "🗑️ Delete",
};

export class EditorApp {
  private _scene: Scene = new Scene();

  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private currentTool: Tool | null = null;

  private activeMoleculeId = signal("");

  constructor(
    private container: HTMLElement,
    private readonly createMoleculeService: CreateMoleculeService,
    private readonly createAtomService: CreateAtomService,
    private readonly createBondService: CreateBondService,
    private readonly deleteAtomService: DeleteAtomService,
    private readonly updateAtomService: UpdateAtomService,
    private readonly findAtomService: FindAtomAtService,
    private readonly getAtomOrBondAtService: GetAtomOrBondAtService,
    private readonly deleteBondService: DeleteBondService,
    private readonly updateBondTypeService: UpdateBondTypeService,
  ) {
    this.canvas = document.createElement("canvas");
    this.renderer = new CanvasRenderer(this.canvas);

    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";

    const canvasContainer = document.createElement("div");
    canvasContainer.style.flexGrow = "1";

    canvasContainer.appendChild(this.canvas);

    this.canvas.style.display = "block";
    this.canvas.style.backgroundColor = "#f0f0f0";

    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.gap = "8px";
    toolbar.style.padding = "10px";
    toolbar.style.background = "#f5f5f5";
    toolbar.style.borderBottom = "1px solid #ddd";

    this.container.appendChild(toolbar);
    this.container.appendChild(canvasContainer);

    this.initToolbarTools(toolbar);
    this.setupCanvas(canvasContainer);
  }

  public async run() {
    const setupResult = await this.createMoleculeService.execute();

    setupResult.match(
      (id) => {
        this.activeMoleculeId.value = id;
        this.setTool("atom");
      },
      (error) => console.error(`Failed to start Editor: ${error.message}`),
    );

    effect(() => this.draw());
  }

  private setupCanvas(canvasContainer: HTMLDivElement) {
    const resizeCanvas = () => {
      this.canvas.width = canvasContainer.getBoundingClientRect().width;
      this.canvas.height = canvasContainer.getBoundingClientRect().height;
      this.draw();
    };
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasContainer);

    resizeCanvas();
  }

  private draw() {
    if (!this.activeMoleculeId.value) return;

    this.renderer.clear();

    this._scene.bonds.value.forEach((bond) => {
      const atomA = this._scene.atoms.value.find((a) => a.id === bond.atomAId);
      const atomB = this._scene.atoms.value.find((a) => a.id === bond.atomBId);
      if (atomA && atomB) {
        const isHovered = this.isBondHovered(bond.atomAId, bond.atomBId);
        this.renderer.drawBond(
          { x: atomA.x, y: atomA.y },
          { x: atomB.x, y: atomB.y },
          bond.type,
          isHovered,
        );
      }
    });

    const bondedAtomIds = new Set(
      this._scene.bonds.value.flatMap((b) => [b.atomAId, b.atomBId]),
    );

    const atomSortingFn = (a: AtomDTO, b: AtomDTO) => {
      const aHighlighted = this._scene.hoveredAtomId.value === a.id;
      const bHighlighted = this._scene.hoveredAtomId.value === b.id;
      if (aHighlighted && !bHighlighted) return 1;
      if (!aHighlighted && bHighlighted) return -1;
      return 0;
    };

    [...this._scene.atoms.value].sort(atomSortingFn).forEach((atom) => {
      const isHovered = this._scene.hoveredAtomId.value === atom.id;
      const hasBonds = bondedAtomIds.has(atom.id);

      this.renderer.drawAtom(
        { symbol: atom.symbol },
        { x: atom.x, y: atom.y },
        isHovered,
        hasBonds,
      );
    });
  }

  private isBondHovered(atomAId: string, atomBId: string): boolean {
    const hovered = this._scene.hoveredBondAtomIds.value;
    if (!hovered) return false;

    return (
      (hovered[0] === atomAId && hovered[1] === atomBId) ||
      (hovered[0] === atomBId && hovered[1] === atomAId)
    );
  }

  private initToolbarTools(toolbar: HTMLDivElement) {
    Object.entries(availableTools).forEach(([id, label]) => {
      const btn = document.createElement("button");
      btn.className = "chem-tool-btn";
      btn.dataset.tool = id;
      btn.textContent = label;
      btn.style.padding = "6px 12px";
      btn.style.cursor = "pointer";

      if (id === "atom") {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        this.updateToolbarUI(btn);
        this.setTool(id as keyof typeof availableTools);
      });

      toolbar.appendChild(btn);
    });
  }

  private updateToolbarUI(activeBtn: HTMLButtonElement) {
    const buttons = this.container.querySelectorAll(".chem-tool-btn");

    buttons.forEach((b) => {
      b.classList.remove("active");
      (b as HTMLButtonElement).style.fontWeight = "normal";
      (b as HTMLButtonElement).style.background = "";
    });

    activeBtn.classList.add("active");
    activeBtn.style.fontWeight = "bold";
    activeBtn.style.background = "#d0e8ff";
  }

  public setTool(name: keyof typeof availableTools) {
    let tool: Tool | null = null;
    switch (name) {
      case "atom":
        tool = new DrawTool(
          this.canvas,
          this.activeMoleculeId.value,
          this.createAtomService,
        );
        break;
      case "bond":
        tool = new BondTool(
          this.canvas,
          this.activeMoleculeId.value,
          this.createBondService,
          this.findAtomService,
          this._scene,
        );
        break;
      case "edit":
        tool = new EditTool(
          this.canvas,
          this.activeMoleculeId.value,
          this.updateAtomService,
          this.updateBondTypeService,
          this.getAtomOrBondAtService,
          this._scene,
        );
        break;
      case "delete":
        tool = new DeleteTool(
          this.canvas,
          this.activeMoleculeId.value,
          this.deleteAtomService,
          this.deleteBondService,
          this.getAtomOrBondAtService,
          this._scene,
        );
        break;
      default:
        console.warn(`Unknown tool: ${name}`);
    }

    if (!tool) return;

    if (this.currentTool) {
      this.currentTool.deactivate();
    }
    this.currentTool = tool;
    this.currentTool.activate();
  }

  public get scene(): Scene {
    return this._scene;
  }
}
