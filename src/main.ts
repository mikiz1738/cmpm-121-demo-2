import "./style.css";

const APP_NAME = "An Amazing Game!";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create a title
const title = document.createElement("h1");
title.textContent = "A very fun time!";
title.style.color = "black";
title.style.textAlign = "center";
app.appendChild(title);

// Create a canvas element
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("styled-canvas");
app.appendChild(canvas);

// Create buttons for "Clear", "Undo", "Redo", "Thin", and "Thick" tools
const buttonsConfig = [
  { text: "Clear Canvas", id: "clear-button" },
  { text: "Undo", id: "undo-button" },
  { text: "Redo", id: "redo-button" },
  { text: "Thin Marker", id: "thin-button" },
  { text: "Thick Marker", id: "thick-button" },
];

buttonsConfig.forEach(({ text, id }) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.id = id;
  button.style.margin = "10px 5px";
  app.appendChild(button);
});

const clearButton = document.getElementById("clear-button")!;
const undoButton = document.getElementById("undo-button")!;
const redoButton = document.getElementById("redo-button")!;
const thinButton = document.getElementById("thin-button")!;
const thickButton = document.getElementById("thick-button")!;

// Canvas drawing context
const ctx = canvas.getContext("2d")!;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

// MarkerLine class with dynamic thickness
class MarkerLine {
  private points: { x: number; y: number }[] = [];
  private lineWidth: number;

  constructor(startX: number, startY: number, lineWidth: number) {
    this.points.push({ x: startX, y: startY });
    this.lineWidth = lineWidth;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    this.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  }
}

// Variables to store the drawing data
let paths: MarkerLine[] = [];
let redoStack: MarkerLine[] = [];
let currentLine: MarkerLine | null = null;
let selectedLineWidth = 2;  // Default to "thin" marker

// Set up event listeners for thin and thick buttons
function selectTool(button: HTMLButtonElement, lineWidth: number) {
  selectedLineWidth = lineWidth;
  [thinButton, thickButton].forEach(btn => btn.classList.remove("selectedTool"));
  button.classList.add("selectedTool");
}

thinButton.addEventListener("click", () => selectTool(thinButton, 2));
thickButton.addEventListener("click", () => selectTool(thickButton, 6));

// Function to start drawing (create a new MarkerLine)
canvas.addEventListener("mousedown", (event) => {
  currentLine = new MarkerLine(event.offsetX, event.offsetY, selectedLineWidth);
  paths.push(currentLine);
  redoStack = [];
  canvas.addEventListener("mousemove", draw);
  dispatchDrawingChanged();
});

function draw(event: MouseEvent) {
  currentLine?.drag(event.offsetX, event.offsetY);
  dispatchDrawingChanged();
}

// Stop drawing
canvas.addEventListener("mouseup", () => {
  canvas.removeEventListener("mousemove", draw);
  currentLine = null;
});

function dispatchDrawingChanged() {
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
}

// Observer for "drawing-changed" event
canvas.addEventListener("drawing-changed", () => {
  clearCanvas();
  redrawCanvas();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawCanvas() {
  paths.forEach((path) => path.display(ctx));
}

// Clear button event
clearButton.addEventListener("click", () => {
  paths = [];
  redoStack = [];
  clearCanvas();
});

// Undo button event
undoButton.addEventListener("click", () => {
  if (paths.length > 0) {
    redoStack.push(paths.pop()!);
    dispatchDrawingChanged();
  }
});

// Redo button event
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    paths.push(redoStack.pop()!);
    dispatchDrawingChanged();
  }
});
