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
  { text: "🐱 Cat Sticker", id: "cat-sticker" },
  { text: "🌟 Star Sticker", id: "star-sticker" },
  { text: "❤️ Heart Sticker", id: "heart-sticker" },
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
const catStickerButton = document.getElementById("cat-sticker")!;
const starStickerButton = document.getElementById("star-sticker")!;
const heartStickerButton = document.getElementById("heart-sticker")!;

// Canvas drawing context
const ctx = canvas.getContext("2d")!;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

// MarkerLine class for drawing lines
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

// ToolPreview class for line thickness preview
class ToolPreview {
  private x: number;
  private y: number;
  private radius: number;

  constructor(radius: number) {
    this.x = 0;
    this.y = 0;
    this.radius = radius / 2;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// StickerPreview command for showing sticker preview
class StickerPreview {
  private x: number;
  private y: number;
  private emoji: string;

  constructor(emoji: string) {
    this.x = 0;
    this.y = 0;
    this.emoji = emoji;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "30px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Sticker command for placing and moving stickers
class Sticker {
  private x: number;
  private y: number;
  private emoji: string;

  constructor(x: number, y: number, emoji: string) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "30px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Variables to store drawing data
let paths: MarkerLine[] = [];
let stickers: Sticker[] = [];
let redoStack: MarkerLine[] = [];
let currentLine: MarkerLine | null = null;
let selectedLineWidth = 2;
let toolPreview: ToolPreview | StickerPreview | null = new ToolPreview(selectedLineWidth);
let selectedSticker: string | null = null;

// Set up tool and sticker selection
function selectTool(button: HTMLButtonElement, lineWidth: number) {
  selectedLineWidth = lineWidth;
  toolPreview = new ToolPreview(lineWidth);
  selectedSticker = null;
}

function selectSticker(button: HTMLButtonElement, emoji: string) {
  selectedSticker = emoji;
  toolPreview = new StickerPreview(emoji);
  canvas.dispatchEvent(new Event("tool-moved"));
}

// Event listeners for marker and sticker buttons
thinButton.addEventListener("click", () => selectTool(thinButton, 2));
thickButton.addEventListener("click", () => selectTool(thickButton, 6));
catStickerButton.addEventListener("click", () => selectSticker(catStickerButton, "🐱"));
starStickerButton.addEventListener("click", () => selectSticker(starStickerButton, "🌟"));
heartStickerButton.addEventListener("click", () => selectSticker(heartStickerButton, "❤️"));

// Drawing and tool preview event handling
canvas.addEventListener("mousedown", (event) => {
  if (selectedSticker) {
    const sticker = new Sticker(event.offsetX, event.offsetY, selectedSticker);
    stickers.push(sticker);
    toolPreview = null;
  } else {
    currentLine = new MarkerLine(event.offsetX, event.offsetY, selectedLineWidth);
    paths.push(currentLine);
    redoStack = [];
    toolPreview = null;
  }
  canvas.addEventListener("mousemove", draw);
  dispatchDrawingChanged();
});

function draw(event: MouseEvent) {
  if (selectedSticker) {
    const sticker = stickers[stickers.length - 1];
    sticker.drag(event.offsetX, event.offsetY);
  } else {
    currentLine?.drag(event.offsetX, event.offsetY);
  }
  clearCanvas();
  redrawCanvas();
}

canvas.addEventListener("mouseup", () => {
  canvas.removeEventListener("mousemove", draw);
  currentLine = null;
  if (selectedSticker) toolPreview = new StickerPreview(selectedSticker);
  else toolPreview = new ToolPreview(selectedLineWidth);
});

canvas.addEventListener("mousemove", (event) => {
  if (!currentLine && toolPreview) {
    toolPreview.updatePosition(event.offsetX, event.offsetY);
    dispatchToolMoved();
  }
});

function dispatchToolMoved() {
  canvas.dispatchEvent(new Event("tool-moved"));
}

canvas.addEventListener("tool-moved", () => {
  clearCanvas();
  redrawCanvas();
  toolPreview?.draw(ctx);
});

// Clear, Undo, and Redo Button Events
clearButton.addEventListener("click", () => {
  paths = [];
  stickers = [];
  redoStack = [];
  clearCanvas();
});

undoButton.addEventListener("click", () => {
  if (paths.length > 0) redoStack.push(paths.pop()!);
  dispatchDrawingChanged();
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) paths.push(redoStack.pop()!);
  dispatchDrawingChanged();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawCanvas() {
  paths.forEach((path) => path.display(ctx));
  stickers.forEach((sticker) => sticker.display(ctx));
}

// Initial call to set up tool preview
selectTool(thinButton, 2);
