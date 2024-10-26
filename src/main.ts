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

// Initial sticker configuration
const stickersConfig = [
  { text: "🐱 Cat", emoji: "🐱" },
  { text: "🌟 Star", emoji: "🌟" },
  { text: "❤️ Heart", emoji: "❤️" },
];

// Create tool and sticker buttons
const buttonsConfig = [
  { text: "Clear Canvas", id: "clear-button" },
  { text: "Undo", id: "undo-button" },
  { text: "Redo", id: "redo-button" },
  { text: "Thin Marker", id: "thin-button" },
  { text: "Thick Marker", id: "thick-button" },
  { text: "Add Custom Sticker", id: "custom-sticker-button" },
];

// Render tool buttons
buttonsConfig.forEach(({ text, id }) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.id = id;
  button.style.margin = "10px 5px";
  app.appendChild(button);
});

// Render sticker buttons
stickersConfig.forEach(({ text, emoji }) => createStickerButton(text, emoji));

function createStickerButton(text: string, emoji: string) {
  const button = document.createElement("button");
  button.textContent = text;
  button.dataset.emoji = emoji;
  button.style.margin = "10px 5px";
  app.appendChild(button);

  button.addEventListener("click", () => selectSticker(emoji));
}

const clearButton = document.getElementById("clear-button")!;
const undoButton = document.getElementById("undo-button")!;
const redoButton = document.getElementById("redo-button")!;
const thinButton = document.getElementById("thin-button")!;
const thickButton = document.getElementById("thick-button")!;
const customStickerButton = document.getElementById("custom-sticker-button")!;

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

// Sticker class for placing and moving stickers
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
let selectedSticker: string | null = null;

// Event listeners for tool buttons
thinButton.addEventListener("click", () => selectTool(2));
thickButton.addEventListener("click", () => selectTool(6));

// Event listener for adding custom sticker
customStickerButton.addEventListener("click", () => {
  const userEmoji = prompt("Enter your custom sticker:", "🎉");
  if (userEmoji) {
    stickersConfig.push({ text: `Custom ${userEmoji}`, emoji: userEmoji });
    createStickerButton(`Custom ${userEmoji}`, userEmoji);
  }
});

// Set up tool and sticker selection
function selectTool(lineWidth: number) {
  selectedLineWidth = lineWidth;
  selectedSticker = null;
}

function selectSticker(emoji: string) {
  selectedSticker = emoji;
}

// Drawing and sticker placement
canvas.addEventListener("mousedown", (event) => {
  if (selectedSticker) {
    const sticker = new Sticker(event.offsetX, event.offsetY, selectedSticker);
    stickers.push(sticker);
  } else {
    currentLine = new MarkerLine(event.offsetX, event.offsetY, selectedLineWidth);
    paths.push(currentLine);
    redoStack = [];
  }
  canvas.addEventListener("mousemove", draw);
});

function draw(event: MouseEvent) {
  if (currentLine) {
    currentLine.drag(event.offsetX, event.offsetY);
  }
  clearCanvas();
  redrawCanvas();
}

canvas.addEventListener("mouseup", () => {
  canvas.removeEventListener("mousemove", draw);
  currentLine = null;
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawCanvas() {
  paths.forEach((path) => path.display(ctx));
  stickers.forEach((sticker) => sticker.display(ctx));
}

// Clear, Undo, and Redo Button Events
clearButton.addEventListener("click", () => {
  paths = [];
  stickers = [];
  redoStack = [];
  clearCanvas();
});

undoButton.addEventListener("click", () => {
  if (paths.length > 0) redoStack.push(paths.pop()!);
  clearCanvas();
  redrawCanvas();
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) paths.push(redoStack.pop()!);
  clearCanvas();
  redrawCanvas();
});
