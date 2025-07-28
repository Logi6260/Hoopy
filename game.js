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

const ballRadius = 15;
const hoopWidth = 120;
const hoopHeight = 20;

let scrollX = 0;
let scrollSpeed = 1.5;

let hoops = [];
let score = 0;
let level = 1;
let gapsize = 160; // starting gap size

const gravity = 0.7;

const BOUNCE_VELOCITY = -8; // vertical bounce velocity
const HORIZONTAL_BOUNCE_BOOST = 1.5; // horizontal bounce multiplier

const ball = {
  x: width / 4,
  y: height - ballRadius - 100,
  vx: 3,
  vy: 0,
  radius: ballRadius,
};

let gameStarted = false;
let animationFrameId = null;

function createHoop(xPos) {
  const y = 100 + Math.random() * (height - 200);
  return { x: xPos, y, width: hoopWidth, height: hoopHeight };
}

function initHoops() {
  hoops = [];
  let xPos = 400;
  for (let i = 0; i < 50; i++) {
    hoops.push(createHoop(xPos));
    xPos += gapsize;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#FF4081'; // pink
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawHoop(hoop) {
  ctx.beginPath();
  ctx.strokeStyle = '#00BCD4'; // cyan
  ctx.lineWidth = 6;
  ctx.rect(hoop.x - scrollX, hoop.y, hoop.width, hoop.height);
  ctx.stroke();
  ctx.closePath();
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Level: ${level}`, 20, 70);
}

function drawStartScreen() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Tap to Start', width / 2, height / 2);
}

function bounceBall() {
  ball.vy = BOUNCE_VELOCITY;
  ball.vx *= HORIZONTAL_BOUNCE_BOOST;
}

function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  // Move ball
  ball.vy += gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Bounce off floor
  if (ball.y + ball.radius > height) {
    ball.y = height - ball.radius;
    bounceBall();
  }

  // Bounce off ceiling
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = 0;
  }

  // Scroll screen
  scrollX += scrollSpeed;

  // Draw hoops and check scoring
  for (let i = 0; i < hoops.length; i++) {
    const hoop = hoops[i];
    drawHoop(hoop);

    if (
      ball.x > hoop.x - scrollX &&
      ball.x < hoop.x - scrollX + hoop.width &&
      ball.y + ball.radius > hoop.y &&
      ball.y - ball.radius < hoop.y + hoop.height
    ) {
      score++;
      hoops.splice(i, 1);
      i--;
      if (score % 10 === 0) {
        level++;
        scrollSpeed += 0.5;
        gapsize = Math.max(100, gapsize - 10);
        let lastX = hoops.length ? hoops[hoops.length - 1].x : scrollX + width + gapsize;
        hoops.push(createHoop(lastX + gapsize));
      }
    }
  }

  drawBall();
  drawScore();

  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  gameStarted = true;
  initHoops();
  ball.x = width / 4;
  ball.y = height - ballRadius - 100;
  ball.vx = 3;
  ball.vy = 0;
  scrollX = 0;
  score = 0;
  level = 1;
  gapsize = 160;
  gameLoop();
}

// Draw start screen initially
drawStartScreen();

// Use both click and touch to start and bounce
function handleStartOrBounce() {
  if (!gameStarted) {
    startGame();
  } else {
    bounceBall();
  }
}

canvas.addEventListener('click', handleStartOrBounce);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // prevent mobile scroll
  handleStartOrBounce();
}, { passive: false });
