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

// Set the canvas pixel size
canvas.width = 256;  // Width in pixels
canvas.height = 256; // Height in pixels

// Optionally, style the canvas (e.g., background color, border)
canvas.style.border = "1px solid black"; // Adds a black border around the canvas

// Append the canvas to the #app element
app.appendChild(canvas);