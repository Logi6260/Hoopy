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

let gapSize = 150;
const minGapSize = 70;
const gapDecreaseStep = 10;

const hoopWidth = 20; // 👈 Thinner hoops
const hoopSpacing = 300;

let gameStarted = false;
let gameOver = false;

// Input control
let bounceRequested = false;

window.addEventListener('touchstart', handleJump);
window.addEventListener('mousedown', handleJump);
function handleJump() {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
  } else if (gameOver) {
    resetGame();
  } else {
    bounceRequested = true;
  }
}

// Hoops
const hoops = [];
let scrollX = 0;

function createHoop(x) {
  const margin = gapSize / 2 + 40;
  const gapCenter = Math.random() * (height - margin * 2) + margin;
  return { x, gapCenter, gapSizeCurrent: gapSize };
}

function updateHoopGap() {
  if (hoopCount > 0 && hoopCount % 10 === 0) {
    gapSize = Math.max(minGapSize, gapSize - gapDecreaseStep);
  }
}

function initHoops() {
  hoops.length = 0;
  const initialHoops = Math.ceil(width / hoopSpacing) + 3;
  for (let i = 0; i < initialHoops; i++) {
    hoops.push(createHoop(i * hoopSpacing + width));
  }
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
  const gapTop = hoop.gapCenter - hoop.gapSizeCurrent / 2;
  const gapBottom = hoop.gapCenter + hoop.gapSizeCurrent / 2;

  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 10;

  // Top bar
  ctx.fillRect(x, 0, hoopWidth, gapTop);
  // Bottom bar
  ctx.fillRect(x, gapBottom, hoopWidth, height - gapBottom);

  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${hoopCount}`, 20, 40);
}

function updatePhysics() {
  if (bounceRequested) {
    ballVelocity = bouncePower;
    bounceRequested = false;
  }

  ballVelocity += gravity;
  ballY += ballVelocity;

  // Prevent going out of bounds
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
    if (hoopX < 100 + ballRadius && hoopX + hoopWidth > 100 - ballRadius) {
      if (
        ballY - ballRadius < hoop.gapCenter - hoop.gapSizeCurrent / 2 ||
        ballY + ballRadius > hoop.gapCenter + hoop.gapSizeCurrent / 2
      ) {
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

function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Hoopy!', width / 2, height / 2 - 40);

  ctx.font = '28px Arial';
  ctx.fillText('Tap to Start', width / 2, height / 2 + 20);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', width / 2, height / 2 - 20);

  ctx.font = '28px Arial';
  ctx.fillText(`Final Score: ${hoopCount}`, width / 2, height / 2 + 30);
  ctx.fillText('Tap to Restart', width / 2, height / 2 + 70);
}

function resetGame() {
  ballY = height / 2;
  ballVelocity = 0;
  scrollX = 0;
  hoopCount = 0;
  gapSize = 150;
  initHoops();
  gameOver = false;
  bounceRequested = false;
}

function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  if (!gameStarted) {
    drawStartScreen();
  } else {
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
  }

  requestAnimationFrame(gameLoop);
}

initHoops();
gameLoop();
