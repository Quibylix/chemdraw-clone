import { BondType } from "../chemistry/domain/entities/bond";
import { ScreenPoint } from "./screen-point";

const BOND_LINE_WIDTH = 2;
const BOND_LINE_COLOR = "#333";
const BOND_HIGHLIGHT_WIDTH = 8;
const BOND_HIGHLIGHT_COLOR = "#defa";
const DOUBLE_BOND_SPACING = 4;
const TRIPLE_BOND_SPACING = 4;

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawAtom(
    atom: { symbol: string },
    position: ScreenPoint,
    highlighted: boolean = false,
    hasBonds: boolean = false,
  ) {
    const { x, y } = position;
    const symbol = atom.symbol;

    const isBondedCarbon = symbol === "C" && hasBonds;

    if (highlighted) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 15, 0, Math.PI * 2);
      this.ctx.fillStyle = "#defa";
      this.ctx.fill();
    }

    if (isBondedCarbon) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = "#333";
      this.ctx.fill();
      return;
    }

    if (!highlighted) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 15, 0, Math.PI * 2);
      this.ctx.fillStyle = "#fff";
      this.ctx.fill();
    }

    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#333";

    this.ctx.fillText(symbol, x, y);
  }

  public drawBond(
    start: ScreenPoint,
    end: ScreenPoint,
    bondType: BondType = BondType.Single,
    highlighted: boolean = false,
  ) {
    if (highlighted) {
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.strokeStyle = BOND_HIGHLIGHT_COLOR;
      this.ctx.lineWidth = BOND_HIGHLIGHT_WIDTH;
      this.ctx.stroke();
      this.ctx.closePath();
    }

    switch (bondType) {
      case BondType.Single:
        this.drawSingleBond(start, end);
        break;
      case BondType.Double:
        this.drawDoubleBond(start, end);
        break;
      case BondType.Triple:
        this.drawTripleBond(start, end);
        break;
    }
  }

  private drawSingleBond(start: ScreenPoint, end: ScreenPoint) {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.strokeStyle = BOND_LINE_COLOR;
    this.ctx.lineWidth = BOND_LINE_WIDTH;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private drawDoubleBond(start: ScreenPoint, end: ScreenPoint) {
    const offset = this.getPerpendicularOffset(start, end, DOUBLE_BOND_SPACING);

    this.ctx.strokeStyle = BOND_LINE_COLOR;
    this.ctx.lineWidth = BOND_LINE_WIDTH;

    this.ctx.beginPath();
    this.ctx.moveTo(start.x + offset.x, start.y + offset.y);
    this.ctx.lineTo(end.x + offset.x, end.y + offset.y);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.moveTo(start.x - offset.x, start.y - offset.y);
    this.ctx.lineTo(end.x - offset.x, end.y - offset.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private drawTripleBond(start: ScreenPoint, end: ScreenPoint) {
    const offset = this.getPerpendicularOffset(start, end, TRIPLE_BOND_SPACING);

    this.ctx.strokeStyle = BOND_LINE_COLOR;
    this.ctx.lineWidth = BOND_LINE_WIDTH;

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.moveTo(start.x + offset.x, start.y + offset.y);
    this.ctx.lineTo(end.x + offset.x, end.y + offset.y);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.moveTo(start.x - offset.x, start.y - offset.y);
    this.ctx.lineTo(end.x - offset.x, end.y - offset.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private getPerpendicularOffset(
    start: ScreenPoint,
    end: ScreenPoint,
    distance: number,
  ): { x: number; y: number } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    const perpX = -dy / length;
    const perpY = dx / length;

    return {
      x: perpX * distance,
      y: perpY * distance,
    };
  }
}
