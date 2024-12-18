const ball = document.getElementById("ball");
const hole = document.getElementById("hole");
const strokesDisplay = document.getElementById("strokes");
const arrowCanvas = document.getElementById("arrow");
const ctx = arrowCanvas.getContext("2d");
const obstacles = document.querySelectorAll(".obstacle");

let ballPosition = { top: 450, left: 250 }; // Ball start position
let mouseStart = { x: 0, y: 0 }; // Starting mouse position
let isDragging = false;
let strokes = 0;
let velocity = { x: 0, y: 0 };
let isGameResetting = false; // Prevent additional movements during reset

// Prevent text selection while dragging
document.addEventListener("mousedown", (e) => e.preventDefault());

// Update Ball Position
function updateBallPosition() {
    ball.style.top = ballPosition.top + "px";
    ball.style.left = ballPosition.left + "px";
}

// Check for Collisions with Obstacles
function checkCollisions(newLeft, newTop) {
    const ballRect = {
        top: newTop,
        left: newLeft,
        bottom: newTop + 20,
        right: newLeft + 20,
    };

    for (let obstacle of obstacles) {
        const rect = obstacle.getBoundingClientRect();
        const boardRect = document.getElementById("game-board").getBoundingClientRect();

        // Convert to game board-relative positions
        const obstacleRect = {
            top: rect.top - boardRect.top,
            left: rect.left - boardRect.left,
            bottom: rect.bottom - boardRect.top,
            right: rect.right - boardRect.left,
        };

        if (
            ballRect.left < obstacleRect.right &&
            ballRect.right > obstacleRect.left &&
            ballRect.top < obstacleRect.bottom &&
            ballRect.bottom > obstacleRect.top
        ) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Move Ball
function moveBall() {
    if (isGameResetting) return; // Prevent movement during reset

    const newLeft = ballPosition.left + velocity.x;
    const newTop = ballPosition.top + velocity.y;

    // Check for collision before moving
    if (!checkCollisions(newLeft, newTop)) {
        ballPosition.left = Math.max(0, Math.min(480, newLeft));
        ballPosition.top = Math.max(0, Math.min(480, newTop));
    } else {
        velocity.x = 0; // Stop ball movement on collision
        velocity.y = 0;
    }

    velocity.x *= 0.95; // Apply friction
    velocity.y *= 0.95;

    if (Math.abs(velocity.x) < 0.5 && Math.abs(velocity.y) < 0.5) {
        velocity.x = 0;
        velocity.y = 0;
    }

    updateBallPosition();
    checkWin();

    if (velocity.x !== 0 || velocity.y !== 0) {
        requestAnimationFrame(moveBall);
    }
}

// Check Win Condition (1/3 of the Ball Inside the Hole)
function checkWin() {
    const ballRect = ball.getBoundingClientRect();
    const holeRect = hole.getBoundingClientRect();

    // Calculate horizontal and vertical overlaps
    const horizontalOverlap = Math.max(
        0,
        Math.min(ballRect.right, holeRect.right) - Math.max(ballRect.left, holeRect.left)
    );
    const verticalOverlap = Math.max(
        0,
        Math.min(ballRect.bottom, holeRect.bottom) - Math.max(ballRect.top, holeRect.top)
    );

    // Ball width and height
    const ballWidth = ballRect.width;
    const ballHeight = ballRect.height;

    // Check if overlap covers at least 1/3 of the ball
    const isHorizontalIn = horizontalOverlap >= ballWidth / 3;
    const isVerticalIn = verticalOverlap >= ballHeight / 3;

    if (isHorizontalIn && isVerticalIn) {
        ball.style.visibility = "hidden"; // Hide the ball when the win message pops up
        alert(`Congratulations! You made it in ${strokes} strokes.`);
        resetGame();
    }
}

// Reset Game
function resetGame() {
    isGameResetting = true; // Block other movements during reset

    // Reset ball position and strokes
    ballPosition = { top: 450, left: 250 };
    strokes = 0;
    strokesDisplay.textContent = `Strokes: ${strokes}`;
    velocity.x = 0; // Stop any movement
    velocity.y = 0;

    // Update UI
    updateBallPosition();
    ctx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);

    // Show the ball again after reset
    setTimeout(() => {
        ball.style.visibility = "visible";
        isGameResetting = false;
    }, 500);
}

// Mouse Events for Ball
ball.addEventListener("mousedown", (e) => {
    if (isGameResetting) return; // Prevent dragging during reset

    isDragging = true;
    mouseStart.x = e.clientX;
    mouseStart.y = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging && !isGameResetting) {
        drawArrow(mouseStart.x, mouseStart.y, e.clientX, e.clientY);
    }
});

document.addEventListener("mouseup", (e) => {
    if (isDragging && !isGameResetting) {
        isDragging = false;
        ctx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);

        const deltaX = mouseStart.x - e.clientX;
        const deltaY = mouseStart.y - e.clientY;

        velocity.x = deltaX / 10; // Adjust velocity based on drag
        velocity.y = deltaY / 10;

        strokes++;
        strokesDisplay.textContent = `Strokes: ${strokes}`;
        moveBall();
    }
});

// Draw the Arrow
function drawArrow(startX, startY, endX, endY) {
    ctx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);

    const canvasRect = arrowCanvas.getBoundingClientRect();
    const adjustedStartX = startX - canvasRect.left;
    const adjustedStartY = startY - canvasRect.top;
    const adjustedEndX = endX - canvasRect.left;
    const adjustedEndY = endY - canvasRect.top;

    const dx = adjustedEndX - adjustedStartX;
    const dy = adjustedEndY - adjustedStartY;
    const length = Math.hypot(dx, dy);

    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(adjustedStartX, adjustedStartY);
    ctx.lineTo(
        adjustedStartX - Math.cos(angle) * length,
        adjustedStartY - Math.sin(angle) * length
    );
    ctx.stroke();
}

// Initialize Ball Position
updateBallPosition();
