import { CanvasRenderer } from "./canvas-renderer";
import { Scene } from "./scene";
import { Tool } from "./tools/tool";
import { DrawTool } from "./tools/draw-tool";
import { BondTool } from "./tools/bond-tool";
import { DeleteTool } from "./tools/delete-tool";
import { EditTool } from "./tools/edit-tool";
import { HoverChanged } from "./events/hover-changed";
import { AtomAdded } from "./events/atom-added";
import { AtomRemoved } from "./events/atom-removed";
import { AtomUpdated } from "./events/atom-updated";
import { BondAdded } from "./events/bond-added";
import { BondRemoved } from "./events/bond-removed";
import { BondUpdated } from "./events/bond-updated";
import { PresentationEvents } from "./base/presentation-events";
import { MoleculeRepository } from "../chemistry/domain/repositories/molecule-repository";
import { CreateMoleculeService } from "../chemistry/application/use-cases/create-molecule.service";
import { CreateAtomService } from "../chemistry/application/use-cases/create-atom.service";
import { CreateBondService } from "../chemistry/application/use-cases/create-bond.service";
import { DeleteAtomService } from "../chemistry/application/use-cases/delete-atom.service";
import { DeleteBondService } from "../chemistry/application/use-cases/delete-bond.service";
import { UpdateAtomService } from "../chemistry/application/use-cases/update-atom.service";
import { UpdateBondTypeService } from "../chemistry/application/use-cases/update-bond-type.service";
import { GetAtomOrBondAtService } from "../chemistry/application/use-cases/get-atom-or-bond-at.service";
import {
  AtomDTO,
  GetMoleculeQuery,
  GetMoleculeService,
} from "../chemistry/application/use-cases/get-molecule.service";
import { FindAtomAtService } from "../chemistry/application/use-cases/find-atom-at.service";

const availableTools = {
  atom: "🟢 Átomo",
  bond: "🔗 Enlace",
  edit: "✏️ Editar",
  delete: "🗑️ Borrar",
};

export class EditorApp {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private currentTool: Tool | null = null;
  private scene: Scene = new Scene();
  private isUpdatePending = false;

  private activeMoleculeId: string = "";
  private getMoleculeService: GetMoleculeService;
  private findAtomService: FindAtomAtService;
  private getAtomOrBondAtService: GetAtomOrBondAtService;
  private deleteBondService: DeleteBondService;
  private updateBondTypeService: UpdateBondTypeService;

  constructor(
    private container: HTMLElement,
    private readonly repository: MoleculeRepository,
    private readonly createMoleculeService: CreateMoleculeService,
    private readonly createAtomService: CreateAtomService,
    private readonly createBondService: CreateBondService,
    private readonly deleteAtomService: DeleteAtomService,
    private readonly updateAtomService: UpdateAtomService,
  ) {
    this.getMoleculeService = new GetMoleculeService(this.repository);
    this.findAtomService = new FindAtomAtService(this.repository);
    this.getAtomOrBondAtService = new GetAtomOrBondAtService(this.repository);
    this.deleteBondService = new DeleteBondService(this.repository);
    this.updateBondTypeService = new UpdateBondTypeService(this.repository);
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

    this.getMoleculeService
      .execute(new GetMoleculeQuery(this.activeMoleculeId))
      .match(
        (moleculeDto) => {
          this.renderer.clear();

          moleculeDto.bonds.forEach((bond) => {
            const atomA = moleculeDto.atoms.find((a) => a.id === bond.atomAId);
            const atomB = moleculeDto.atoms.find((a) => a.id === bond.atomBId);
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
            moleculeDto.bonds.flatMap((b) => [b.atomAId, b.atomBId]),
          );

          const atomSortingFn = (a: AtomDTO, b: AtomDTO) => {
            const aHighlighted = this.scene.hoveredAtomId === a.id;
            const bHighlighted = this.scene.hoveredAtomId === b.id;
            if (aHighlighted && !bHighlighted) return 1;
            if (!aHighlighted && bHighlighted) return -1;
            return 0;
          };

          moleculeDto.atoms.sort(atomSortingFn).forEach((atom) => {
            const isHovered = this.scene.hoveredAtomId === atom.id;
            const hasBonds = bondedAtomIds.has(atom.id);

            this.renderer.drawAtom(
              { symbol: atom.symbol },
              { x: atom.x, y: atom.y },
              isHovered,
              hasBonds,
            );
          });
        },
        (error) => console.error(error),
      );
  }

  private subscribeToEvents() {
    PresentationEvents.subscribe(AtomAdded, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(AtomRemoved, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(AtomUpdated, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(BondAdded, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(BondRemoved, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(BondUpdated, () => {
      this.requestRedraw();
    });

    PresentationEvents.subscribe(HoverChanged, (e) => {
      this.scene.hoveredAtomId = e.atomId;
      this.scene.hoveredBondAtomIds = e.bondAtomIds;
      this.requestRedraw();
    });
  }

  private isBondHovered(atomAId: string, atomBId: string): boolean {
    const hovered = this.scene.hoveredBondAtomIds;
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
          this.activeMoleculeId,
          this.createAtomService,
        );
        break;
      case "bond":
        tool = new BondTool(
          this.canvas,
          this.activeMoleculeId,
          this.createBondService,
          this.findAtomService,
        );
        break;
      case "edit":
        tool = new EditTool(
          this.canvas,
          this.activeMoleculeId,
          this.updateAtomService,
          this.updateBondTypeService,
          this.getAtomOrBondAtService,
        );
        break;
      case "delete":
        tool = new DeleteTool(
          this.canvas,
          this.activeMoleculeId,
          this.deleteAtomService,
          this.deleteBondService,
          this.getAtomOrBondAtService,
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
