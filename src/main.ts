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

// Set up canvas drawing context
const ctx = canvas.getContext("2d")!;
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';  // Color for the drawing

// Variables to track the drawing state
let isDrawing = false;

// Function to start drawing
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    ctx.beginPath();  // Start a new path
    ctx.moveTo(event.offsetX, event.offsetY);  // Move to the initial mouse position
});

// Function to draw as the mouse moves
canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
        ctx.lineTo(event.offsetX, event.offsetY);  // Draw a line to the new mouse position
        ctx.stroke();  // Render the line
    }
});

// Function to stop drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.closePath();  // Close the current path
});

// Clear canvas when the user clicks the clear button
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the entire canvas
});