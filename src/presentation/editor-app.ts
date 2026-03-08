import { CanvasRenderer } from "./canvas-renderer";
import { Scene } from "./scene";
import { Tool } from "./tools/tool";
import { DrawTool } from "./tools/draw-tool";
import { BondTool } from "./tools/bond-tool";
import { HoverChanged } from "./events/hover-changed";
import { AtomAdded } from "./events/atom-added";
import { BondAdded } from "./events/bond-added";
import { PresentationEvents } from "./base/presentation-events";
import { MoleculeRepository } from "../domain/repositories/molecule-repository";
import { CreateMoleculeService } from "../application/use-cases/create-molecule.service";
import { AddAtomService } from "../application/use-cases/add-atom.service";
import { CreateBondService } from "../application/use-cases/create-bond.service";

const availableTools = {
  atom: "🟢 Átomo",
  bond: "🔗 Enlace",
};

export class EditorApp {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private currentTool: Tool | null = null;
  private scene: Scene = new Scene();
  private isUpdatePending = false;

  private activeMoleculeId: string = "";

  constructor(
    private container: HTMLElement,
    private readonly repository: MoleculeRepository,
    private readonly createMoleculeService: CreateMoleculeService,
    private readonly addAtomService: AddAtomService,
    private readonly createBondService: CreateBondService,
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

    this.subscribeToEvents();
    this.initToolbarTools(toolbar);
    this.setupCanvas(canvasContainer);
  }

  public async run() {
    const setupResult = await this.createMoleculeService.execute();

    setupResult.match(
      (id) => {
        this.activeMoleculeId = id;
        this.setTool("atom");
      },
      (error) => console.error(`Failed to start Editor: ${error.message}`),
    );
  }

  private setupCanvas(canvasContainer: HTMLDivElement) {
    const resizeCanvas = () => {
      this.canvas.width = canvasContainer.getBoundingClientRect().width;
      this.canvas.height = canvasContainer.getBoundingClientRect().height;
      this.requestRedraw();
    };
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasContainer);

    resizeCanvas();
  }

  public requestRedraw(): void {
    if (this.isUpdatePending) return;
    this.isUpdatePending = true;

    requestAnimationFrame(() => {
      this.redraw();
      this.isUpdatePending = false;
    });
  }

  private redraw() {
    if (!this.activeMoleculeId) return;

    this.repository.findById(this.activeMoleculeId).match(
      (molecule) => {
        this.renderer.clear();

        molecule.bonds.forEach((bond) => {
          const start = this.scene.getPosition(bond.atoms[0].id);
          const end = this.scene.getPosition(bond.atoms[1].id);
          if (start && end) {
            this.renderer.drawBond(start, end);
          }
        });

        molecule.atoms.forEach((atom) => {
          const position = this.scene.getPosition(atom.id);
          if (position) {
            const isHovered = this.scene.hoveredAtomId === atom.id;
            this.renderer.drawAtom(atom, position, isHovered);
          }
        });
      },
      (error) => console.error(error),
    );
  }

  private subscribeToEvents() {
    PresentationEvents.subscribe(AtomAdded, (event) => {
      const position = { x: event.x, y: event.y };
      this.scene.addAtom(event.atomId, position);
      this.requestRedraw();
    });

    PresentationEvents.subscribe(BondAdded, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(HoverChanged, () => {
      this.requestRedraw();
    });
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
          this.activeMoleculeId,
          this.addAtomService,
        );
        break;
      case "bond":
        tool = new BondTool(
          this.canvas,
          this.scene,
          this.activeMoleculeId,
          this.createBondService,
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
}
