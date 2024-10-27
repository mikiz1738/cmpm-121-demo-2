import "./style.css";

const APP_NAME = "Magical Sketchbook!";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create a title
const title = document.createElement("h1");
title.textContent = "Welcome to the Magical Sketchbook!";
title.style.color = "darkslateblue";
title.style.textAlign = "center";
app.appendChild(title);

// Create a canvas element
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("styled-canvas");
app.appendChild(canvas);

// Initial charm (sticker) configuration with more magical emojis
const charmsConfig = [
  { text: "🦄 Unicorn", emoji: "🦄" },
  { text: "🌈 Rainbow", emoji: "🌈" },
  { text: "✨ Sparkles", emoji: "✨" },
  { text: "🔥 Fire", emoji: "🔥" },
];

// Create tool and charm buttons with quill and charm theme
const buttonsConfig = [
  { text: "Clear Sketchbook", id: "clear-button" },
  { text: "Undo", id: "undo-button" },
  { text: "Redo", id: "redo-button" },
  { text: "Fine Quill", id: "fine-quill-button" },
  { text: "Bold Quill", id: "bold-quill-button" },
  { text: "Add Custom Charm", id: "custom-charm-button" },
  { text: "Export", id: "export-button" },
];

// Render tool buttons
buttonsConfig.forEach(({ text, id }) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.id = id;
  button.classList.add("tool-button"); // Add CSS class for styling
  app.appendChild(button);
});

// Render charm buttons
charmsConfig.forEach(({ text, emoji }) => createCharmButton(text, emoji));

function createCharmButton(text: string, emoji: string) {
  const button = document.createElement("button");
  button.textContent = text;
  button.dataset.emoji = emoji;
  button.classList.add("charm-button"); // Add CSS class for charm styling
  app.appendChild(button);

  button.addEventListener("click", () => selectCharm(emoji));
}

const clearButton = document.getElementById("clear-button")!;
const undoButton = document.getElementById("undo-button")!;
const redoButton = document.getElementById("redo-button")!;
const fineQuillButton = document.getElementById("fine-quill-button")!;
const boldQuillButton = document.getElementById("bold-quill-button")!;
const customCharmButton = document.getElementById("custom-charm-button")!;
const exportButton = document.getElementById("export-button")!;

// Canvas drawing context
const ctx = canvas.getContext("2d")!;
ctx.lineCap = "round";
ctx.strokeStyle = "midnightblue";

// QuillLine class for drawing lines
class QuillLine {
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

// Charm class for placing and moving charms
class Charm {
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
    ctx.font = "40px Arial"; // Larger size for more visibility
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Variables to store drawing data
let paths: QuillLine[] = [];
let charms: Charm[] = [];
let redoStack: QuillLine[] = [];
let currentLine: QuillLine | null = null;
let selectedLineWidth = 3; // Adjusted initial line width for better balance
let selectedCharm: string | null = null;

// Event listeners for tool buttons
fineQuillButton.addEventListener("click", () => selectTool(2)); // Thinner quill
boldQuillButton.addEventListener("click", () => selectTool(8)); // Thicker quill

// Event listener for adding custom charm
customCharmButton.addEventListener("click", () => {
  const userEmoji = prompt("Enter your custom charm:", "🌟");
  if (userEmoji) {
    charmsConfig.push({ text: `Custom ${userEmoji}`, emoji: userEmoji });
    createCharmButton(`Custom ${userEmoji}`, userEmoji);
  }
});

// Event listener for export button
exportButton.addEventListener("click", exportCanvas);

// Set up tool and charm selection
function selectTool(lineWidth: number) {
  selectedLineWidth = lineWidth;
  selectedCharm = null;
}

function selectCharm(emoji: string) {
  selectedCharm = emoji;
}

// Drawing and charm placement
canvas.addEventListener("mousedown", (event) => {
  if (selectedCharm) {
    const charm = new Charm(event.offsetX, event.offsetY, selectedCharm);
    charms.push(charm);
  } else {
    currentLine = new QuillLine(event.offsetX, event.offsetY, selectedLineWidth);
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
  charms.forEach((charm) => charm.display(ctx));
}

// Clear, Undo, and Redo Button Events
clearButton.addEventListener("click", () => {
  paths = [];
  charms = [];
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

// Export Canvas as PNG function
function exportCanvas() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;
  
  exportCtx.scale(4, 4);
  
  paths.forEach((path) => path.display(exportCtx));
  charms.forEach((charm) => charm.display(exportCtx));

  exportCanvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sketchbook_export.png";
      link.click();
      URL.revokeObjectURL(url);
    }
  });
}
