import { Atom } from "../domain/entities/atom";
import { ScreenPoint } from "./screen-point";

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
    atom: Atom,
    position: ScreenPoint,
    highlighted: boolean = false,
  ) {
    const { x, y } = position;
    const symbol = atom.element.symbol;

    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.fillStyle = highlighted ? "#def" : "#fff";
    this.ctx.fill();

    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#333";

    this.ctx.fillText(symbol, x, y);
  }

  public drawBond(start: ScreenPoint, end: ScreenPoint) {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
