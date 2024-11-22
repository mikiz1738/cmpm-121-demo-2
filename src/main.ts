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

// Preview area to show current tool settings
const previewArea = document.createElement("div");
previewArea.classList.add("preview-area");
app.appendChild(previewArea);

const charmsConfig = [
  { text: "🦄 Unicorn", emoji: "🦄" },
  { text: "🌈 Rainbow", emoji: "🌈" },
  { text: "✨ Sparkles", emoji: "✨" },
  { text: "🔥 Fire", emoji: "🔥" },
];

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
  button.classList.add("tool-button");
  app.appendChild(button);
});

charmsConfig.forEach(({ text, emoji }) => createCharmButton(text, emoji));

function createCharmButton(text: string, emoji: string) {
  const button = document.createElement("button");
  button.textContent = text;
  button.dataset.emoji = emoji;
  button.classList.add("charm-button");
  app.appendChild(button);

  button.addEventListener("click", () => {
    selectCharm(emoji);
    updatePreview(); // Update preview on tool selection
  });
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

class QuillLine {
  private points: { x: number; y: number }[] = [];
  private lineWidth: number;
  private color: string;

  constructor(startX: number, startY: number, lineWidth: number, color: string) {
    this.points.push({ x: startX, y: startY });
    this.lineWidth = lineWidth;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.color;
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

class Charm {
  private x: number;
  private y: number;
  private emoji: string;
  private rotation: number;

  constructor(x: number, y: number, emoji: string, rotation: number) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.rotation = rotation;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = "40px Arial";
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

let paths: QuillLine[] = [];
let charms: Charm[] = [];
let redoStack: QuillLine[] = [];
let currentLine: QuillLine | null = null;
let selectedLineWidth = 3;
let selectedCharm: string | null = null;
let selectedColor = randomColor();
let selectedRotation = randomRotation();

fineQuillButton.addEventListener("click", () => {
  selectTool(2);
  selectedColor = randomColor();
  updatePreview();
});

boldQuillButton.addEventListener("click", () => {
  selectTool(8);
  selectedColor = randomColor();
  updatePreview();
});

customCharmButton.addEventListener("click", () => {
  const userEmoji = prompt("Enter your custom charm:", "🌟");
  if (userEmoji) {
    charmsConfig.push({ text: `Custom ${userEmoji}`, emoji: userEmoji });
    createCharmButton(`Custom ${userEmoji}`, userEmoji);
  }
});

exportButton.addEventListener("click", exportCanvas);

function selectTool(lineWidth: number) {
  selectedLineWidth = lineWidth;
  selectedCharm = null;
}

function selectCharm(emoji: string) {
  selectedCharm = emoji;
  selectedRotation = randomRotation();
}

canvas.addEventListener("mousedown", (event) => {
  if (selectedCharm) {
    const charm = new Charm(event.offsetX, event.offsetY, selectedCharm, selectedRotation);
    charms.push(charm);
  } else {
    currentLine = new QuillLine(event.offsetX, event.offsetY, selectedLineWidth, selectedColor);
    paths.push(currentLine);
    redoStack = [];
  }
  canvas.addEventListener("mousemove", draw);
});

function draw(event: MouseEvent) {
  if (currentLine) {
    currentLine.drag(event.offsetX, event.offsetY);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redrawCanvas();
}

canvas.addEventListener("mouseup", () => {
  canvas.removeEventListener("mousemove", draw);
  currentLine = null;
});

function redrawCanvas() {
  paths.forEach((path) => path.display(ctx));
  charms.forEach((charm) => charm.display(ctx));
}

clearButton.addEventListener("click", () => {
  paths = [];
  charms = [];
  redoStack = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

undoButton.addEventListener("click", () => {
  if (paths.length > 0) redoStack.push(paths.pop()!);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redrawCanvas();
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) paths.push(redoStack.pop()!);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redrawCanvas();
});

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

function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
}

function randomRotation() {
  return Math.floor(Math.random() * 360);
}

function updatePreview() {
  previewArea.textContent = selectedCharm
    ? `Next Charm Rotation: ${selectedRotation}°`
    : `Next Quill Color: ${selectedColor}`;
  previewArea.style.color = selectedColor;
}

// Add on-screen instructions
function addInstructions() {
  const instructions = document.createElement("div");
  instructions.classList.add("instructions");
  instructions.textContent = `
    ✨ Welcome to the Magical Sketchbook! ✨
    - Draw with the Fine or Bold Quill buttons. 
    - Add fun charms like 🦄 or 🌈.
    - Use the Clear, Undo, Redo, and Export buttons to manage your drawing.
    - Add your own charm with the "Add Custom Charm" button.
  `;
  instructions.style.padding = "10px";
  instructions.style.color = "#438490";
  instructions.style.backgroundColor = "#ffebcd"; // Light background for contrast
  instructions.style.textAlign = "center";
  instructions.style.marginTop = "10px";
  app.appendChild(instructions);
}

// Call the function to add instructions when the app loads
addInstructions();