const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

const ballRadius = 20;
let ballY = height / 2;
let ballVelocity = 0;
const gravity = 0.6;
const bouncePower = -12;

let scrollSpeed = 3;
let hoopCount = 0;

let gapSize = 150;           // Start big gap
const minGapSize = 70;       // Minimum gap size
const gapDecreaseStep = 10;  // Gap shrinks by this every 10 hoops

// Controls
let isTouching = false;
window.addEventListener('touchstart', () => { isTouching = true; });
window.addEventListener('touchend', () => { isTouching = false; });
window.addEventListener('mousedown', () => { isTouching = true; });
window.addEventListener('mouseup', () => { isTouching = false; });

// Hoop data
const hoops = [];
const hoopWidth = 80;
const hoopSpacing = 300; // horizontal spacing between hoops
let scrollX = 0;

function randomGapPosition() {
  // Keep hoop's vertical center within canvas bounds
  const margin = gapSize / 2 + 40;
  return Math.random() * (height - margin * 2) + margin;
}

function createHoop(x) {
  const gapCenter = randomGapPosition();
  return { x, gapCenter };
}

function updateHoopGap() {
  if (hoopCount > 0 && hoopCount % 10 === 0) {
    gapSize = Math.max(minGapSize, gapSize - gapDecreaseStep);
  }
}

// Initialize hoops to fill screen + some extra
const initialHoops = Math.ceil(width / hoopSpacing) + 2;
for (let i = 0; i < initialHoops; i++) {
  hoops.push(createHoop(i * hoopSpacing + width));
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff8888';
  ctx.shadowBlur = 20;
  ctx.arc(100, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawHoop(hoop) {
  const x = hoop.x - scrollX;
  const gapTop = hoop.gapCenter - gapSize / 2;
  const gapBottom = hoop.gapCenter + gapSize / 2;

  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 10;

  // Draw top part of hoop
  ctx.fillRect(x, 0, hoopWidth, gapTop);

  // Draw bottom part of hoop
  ctx.fillRect(x, gapBottom, hoopWidth, height - gapBottom);

  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = '#222';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${hoopCount}`, 20, 40);
}

function updatePhysics() {
  if (isTouching) {
    ballVelocity = bouncePower;
  } else {
    ballVelocity += gravity;
  }
  ballY += ballVelocity;

  // Keep ball inside canvas vertically
  if (ballY + ballRadius > height) {
    ballY = height - ballRadius;
    ballVelocity = 0;
  }
  if (ballY - ballRadius < 0) {
    ballY = ballRadius;
    ballVelocity = 0;
  }
}

function checkCollision() {
  for (const hoop of hoops) {
    const hoopX = hoop.x - scrollX;
    // Check if ball is within hoop horizontal bounds
    if (hoopX < 100 + ballRadius && hoopX + hoopWidth > 100 - ballRadius) {
      // Check if ball is within gap vertically
      if (ballY - ballRadius < hoop.gapCenter - gapSize / 2 ||
          ballY + ballRadius > hoop.gapCenter + gapSize / 2) {
        // Collision detected
        return true;
      }
    }
  }
  return false;
}

function removePassedHoops() {
  while (hoops.length && hoops[0].x - scrollX + hoopWidth < 0) {
    hoops.shift();
    hoopCount++;
    updateHoopGap();
    hoops.push(createHoop(hoops[hoops.length - 1].x + hoopSpacing));
  }
}

let gameOver = false;

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', width / 2, height / 2 - 20);
  ctx.font = '24px Arial';
  ctx.fillText(`Final Score: ${hoopCount}`, width / 2, height / 2 + 30);
  ctx.fillText('Tap to Restart', width / 2, height / 2 + 70);
}

function resetGame() {
  ballY = height / 2;
  ballVelocity = 0;
  scrollX = 0;
  hoopCount = 0;
  gapSize = 150;
  hoops.length = 0;
  const initialHoops = Math.ceil(width / hoopSpacing) + 2;
  for (let i = 0; i < initialHoops; i++) {
    hoops.push(createHoop(i * hoopSpacing + width));
  }
  gameOver = false;
}

canvas.addEventListener('click', () => {
  if (gameOver) {
    resetGame();
  } else {
    isTouching = true;
  }
});
canvas.addEventListener('touchstart', () => {
  if (gameOver) {
    resetGame();
  } else {
    isTouching = true;
  }
});
canvas.addEventListener('touchend', () => {
  isTouching = false;
});
canvas.addEventListener('mouseup', () => {
  isTouching = false;
});
canvas.addEventListener('mouseleave', () => {
  isTouching = false;
});

function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  if (!gameOver) {
    scrollX += scrollSpeed;
    updatePhysics();
    removePassedHoops();

    if (checkCollision()) {
      gameOver = true;
    }
  }

  hoops.forEach(drawHoop);
  drawBall();
  drawScore();

  if (gameOver) {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
