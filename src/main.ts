import "./style.css";

const appElement = document.querySelector<HTMLDivElement>("#app")!;

appElement.innerHTML = `
  <div class="chem-editor-container">
    <div class="chem-toolbar">
      <button class="chem-tool-btn" data-tool="atom">Atom (C)</button>
      <button class="chem-tool-btn" data-tool="bond">Bond</button>
      <button class="chem-tool-btn" data-tool="eraser">Eraser</button>
      <button class="chem-tool-btn" data-tool="clear">Clear All</button>
    </div>
    <div class="chem-canvas-container">
      <canvas id="chem-canvas"></canvas>
    </div>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#chem-canvas")!;

const resizeCanvas = () => {
  canvas.width = window.innerWidth - 60;
  canvas.height = window.innerHeight;
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

console.log("ChemDraw Clone Initialized");
