import "./style.css";

const APP_NAME = "An Amazing Game!";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement('h1');
title.textContent = "A very fun time!";

// Styling for the title
title.style.color = 'black';
title.style.textAlign = 'center';

// Append the title to the #app element instead of the body
app.appendChild(title);

// Create a canvas element
const canvas = document.createElement('canvas');
canvas.width = 256;  // Width in pixels
canvas.height = 256; // Height in pixels
canvas.classList.add('styled-canvas');
app.appendChild(canvas);

// Create a "Clear" button
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

// Variables to store the drawing data (array of paths, each path is an array of points)
let paths: { x: number; y: number }[][] = [];  // Display list for undo
let redoStack: { x: number; y: number }[][] = [];  // Redo stack
let currentPath: { x: number; y: number }[] = [];
let isDrawing = false;

// Function to start drawing (begin a new path)
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    currentPath = [];  // Start a new path
    paths.push(currentPath);  // Add the new path to the paths array
    redoStack = [];  // Clear the redo stack when a new drawing starts
    addPoint(event);
    dispatchDrawingChanged();
});

// Function to add points as the mouse moves
canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
        addPoint(event);
        dispatchDrawingChanged();
    }
});

// Function to stop drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Function to add a point to the current path
function addPoint(event: MouseEvent) {
    const point = { x: event.offsetX, y: event.offsetY };
    currentPath.push(point);
}

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
    paths.forEach(path => {
        ctx.beginPath();
        path.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);  // Start at the first point of the path
            } else {
                ctx.lineTo(point.x, point.y);  // Draw a line to each subsequent point
            }
        });
        ctx.stroke();
    });
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