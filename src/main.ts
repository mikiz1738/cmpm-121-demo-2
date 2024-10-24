import "./style.css";

const APP_NAME = "An Amazing Game!";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create a title
const title = document.createElement('h1');
title.textContent = "A very fun time!";
title.style.color = 'black';
title.style.textAlign = 'center';
app.appendChild(title);

// Create a canvas element
const canvas = document.createElement('canvas');
canvas.width = 256;  // Width in pixels
canvas.height = 256; // Height in pixels
canvas.classList.add('styled-canvas');
app.appendChild(canvas);

// Create buttons for "Clear", "Undo", and "Redo"
const clearButton = document.createElement('button');
clearButton.textContent = "Clear Canvas";
clearButton.style.marginTop = "20px";
app.appendChild(clearButton);

const undoButton = document.createElement('button');
undoButton.textContent = "Undo";
undoButton.style.marginTop = "10px";
app.appendChild(undoButton);

const redoButton = document.createElement('button');
redoButton.textContent = "Redo";
redoButton.style.marginTop = "10px";
app.appendChild(redoButton);

// Set up canvas drawing context
const ctx = canvas.getContext("2d")!;
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

// MarkerLine class representing a drawable line
class MarkerLine {
    private points: { x: number; y: number }[] = [];

    constructor(startX: number, startY: number) {
        this.points.push({ x: startX, y: startY });
    }

    // Method to extend the line as the user drags the mouse
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    // Method to draw the line on the canvas context
    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length < 2) return;
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

// Variables to store the drawing data (array of MarkerLine objects)
let paths: MarkerLine[] = [];  // Display list for undo
let redoStack: MarkerLine[] = [];  // Redo stack
let currentLine: MarkerLine | null = null;  // Active drawing line
let isDrawing = false;

// Function to start drawing (create a new MarkerLine)
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    currentLine = new MarkerLine(event.offsetX, event.offsetY);  // Start a new line
    paths.push(currentLine);  // Add the new line to the paths array
    redoStack = [];  // Clear the redo stack when a new drawing starts
    dispatchDrawingChanged();
});

// Function to add points as the mouse moves
canvas.addEventListener('mousemove', (event) => {
    if (isDrawing && currentLine) {
        currentLine.drag(event.offsetX, event.offsetY);  // Extend the current line
        dispatchDrawingChanged();
    }
});

// Function to stop drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    currentLine = null;  // Clear the active line
});

// Custom event dispatcher to notify that drawing has changed
function dispatchDrawingChanged() {
    const drawingChangedEvent = new Event("drawing-changed");
    canvas.dispatchEvent(drawingChangedEvent);
}

// Observer for "drawing-changed" event
canvas.addEventListener("drawing-changed", () => {
    clearCanvas();
    redrawCanvas();
});

// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to redraw the canvas from the paths array
function redrawCanvas() {
    paths.forEach(path => path.display(ctx));
}

// Clear canvas when the user clicks the clear button
clearButton.addEventListener('click', () => {
    paths = [];  // Clear all the paths
    redoStack = [];  // Clear the redo stack as well
    clearCanvas();  // Clear the visual canvas
});

// Undo button event
undoButton.addEventListener('click', () => {
    if (paths.length > 0) {
        const lastPath = paths.pop();  // Remove the last path
        if (lastPath) {
            redoStack.push(lastPath);  // Push the removed path to the redo stack
        }
        dispatchDrawingChanged();  // Trigger redraw
    }
});

// Redo button event
redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const redoPath = redoStack.pop();  // Pop from the redo stack
        if (redoPath) {
            paths.push(redoPath);  // Add the redo path back to the paths array
        }
        dispatchDrawingChanged();  // Trigger redraw
    }
});
