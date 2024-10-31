let velocity, angle, gravity, timeOfFlight; // Variables for physics parameters
let animationId; // Variable to store the ID of the animation frame
const yOffset = 27; // Y-offset for drawing the trajectory
const xOffset = 450; // X-offset to start the trajectory slightly to the right
const tankYOffset = 30; // Y-offset for drawing the tank
const tankXOffset = 425; // X-offset for drawing the tank in the middle

// Load the tank image
const tankImage = new Image();
tankImage.src = 'tank_with_dome.png';
const tankTurret = new Image();
tankTurret.src = 'player_1_barrel.png';


// Draw the tank on the canvas at the start of the trajectory
tankImage.onload = function() {
    drawTank();
};

// Function to draw the tank image on the canvas
function drawTank() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // Rotate and draw turret
    ctx.save();
    ctx.translate(xOffset, canvas.height - yOffset); // Set pivot point for rotation at the turret's base
    ctx.rotate((-angle) * (Math.PI / 180)); // Rotate turret according to angle
    ctx.drawImage(tankTurret, 0, -5, 25, 15); // Draw turret rotated
    ctx.restore();
    
    // Draw tank
    ctx.drawImage(tankImage, tankXOffset, canvas.height - tankYOffset, 50, 30); // Adjust size as needed

    
}

// Function to update trajectory calculations and display results
function updateTrajectory() {
    velocity = parseFloat(document.getElementById("velocity").value); // Gets the velocity
    angle = parseFloat(document.getElementById("angle").value); // Gets the angle
    gravity = parseFloat(document.getElementById("gravity").value); // Gets the gravity

    document.getElementById("velocityValue").innerText = velocity;
    document.getElementById("angleValue").innerText = angle;

    const angleRadians = angle * (Math.PI / 180); // Convert angle to radians

    timeOfFlight = (2 * velocity * Math.sin(angleRadians)) / gravity; // Calculates time
    const maxHeight = Math.pow(velocity * Math.sin(angleRadians), 2) / (2 * gravity); // Calculates max height
    const range = (Math.pow(velocity, 2) * Math.sin(2 * angleRadians)) / gravity; // Calculates range

    document.getElementById("timeOfFlight").innerText = `Time of Flight: ${timeOfFlight.toFixed(2)} s`;
    document.getElementById("maxHeight").innerText = `Maximum Height: ${maxHeight.toFixed(2)} m`;
    document.getElementById("range").innerText = `Range: ${range.toFixed(2)} m`;

    drawTrajectory(velocity, angleRadians, gravity, timeOfFlight);
}

// Function to draw the projectile's trajectory on the canvas
function drawTrajectory(velocity, angle, gravity, timeOfFlight) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTank(); // Ensure the tank is drawn on the canvas

    const scale = 0.8; // Scaling factor for the drawing
    const timeStep = 0.2; // Time increment for drawing points

    ctx.beginPath(); // Begin a new path for the trajectory
    ctx.moveTo(xOffset, canvas.height - yOffset); // Move to starting point at the bottom left with xOffset

    // Loop through time increments to calculate trajectory points
    for (let t = 0; t <= timeOfFlight; t += timeStep) {
        const x = velocity * Math.cos(angle) * t; // Calculate x position
        const y = velocity * Math.sin(angle) * t - 0.5 * gravity * t * t; // Calculate y position

        const canvasX = x * scale + xOffset; // Scale x position for drawing and add xOffset
        const offsetY = yOffset * (1 - t / timeOfFlight); // Calculate offset for the curve
        const canvasY = canvas.height - (y * scale) - offsetY; // Calculate final y position for canvas

        ctx.lineTo(canvasX, canvasY); // Draw line to the calculated point
    }

    ctx.strokeStyle = "blue"; // Set stroke color
    ctx.lineWidth = 2; // Set line width
    ctx.stroke(); // Render the trajectory
}

// Function to animate the projectile motion
function fireProjectile() {
    const canvas = document.getElementById("canvas"); // Get the canvas element
    const ctx = canvas.getContext("2d"); // Get the 2D drawing context

    const scale = 0.8; // Scaling factor for the animation
    const angleRadians = angle * (Math.PI / 180); // Convert angle to radians
    const startX = xOffset; // Starting x position with xOffset
    const startY = canvas.height; // Starting y position
    let t = 0; // Time variable for animation
    const timeStep = 0.2; // Time increment for animation

    cancelAnimationFrame(animationId); // Cancel any ongoing animations

    // Function to perform the animation
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawTank(); // Ensure tank image remains during animation
        drawTrajectory(velocity, angleRadians, gravity, timeOfFlight); // Redraw the trajectory

        const x = velocity * Math.cos(angleRadians) * t; // Calculate current x position
        const y = velocity * Math.sin(angleRadians) * t - 0.5 * gravity * t * t; // Calculate current y position

        const canvasX = startX + x * scale; // Scale x position for canvas
        const offsetY = yOffset * (1 - t / timeOfFlight); // Calculate offset for animation
        const canvasY = startY - (y * scale) - offsetY; // Calculate final y position for canvas

        ctx.beginPath(); // Begin a new path for the projectile
        ctx.arc(canvasX, canvasY, 10, 0, 2 * Math.PI); // Draw the projectile as a circle
        ctx.fillStyle = "orange"; // Set fill color for the projectile
        ctx.fill(); // Fill the projectile
        ctx.closePath(); // Close the path

        if (y >= 0) { // Continue animation if projectile is above ground
            t += timeStep; // Increment time
            animationId = requestAnimationFrame(animate); // Request next frame
        }
    }

    animate(); // Start the animation
}

// Event listeners to update trajectory on input changes
document.getElementById("velocity").addEventListener("input", updateTrajectory);
document.getElementById("angle").addEventListener("input", updateTrajectory);
document.getElementById("gravity").addEventListener("input", updateTrajectory);

// Initial trajectory update on page load
updateTrajectory(); // Call to set initial calculations and draw the trajectory
