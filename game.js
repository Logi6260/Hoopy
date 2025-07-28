const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ball = {
  x: 100,
  y: canvas.height / 2,
  radius: 15,
  velocity: 0,
  gravity: 0.5,
  bouncePower: -9 // Smaller bounce height
};

let hoops = [];
let hoopSpacing = 300;
let hoopSpeed = 2;
let hoopCount = 0;
let gapSize = 200; // Start easy
const minGapSize = 90;
const gapShrink = 10;

let score = 0;
let level = 1;
let started = false;
let lastHoopX = canvas.width + 200;

document.getElementById('startBtn').addEventListener('click', startGame);

function startGame() {
  started = true;
  document.getElementById('startScreen').style.display = 'none';
  resetGame();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  ball.y = canvas.height / 2;
  ball.velocity = 0;
  hoops = [];
  score = 0;
  level = 1;
  hoopCount = 0;
  gapSize = 200;
  lastHoopX = canvas.width + 200;
  for (let i = 0; i < 5; i++) {
    generateHoop(lastHoopX + i * hoopSpacing);
  }
}

function generateHoop(x) {
  const minY = 100;
  const maxY = canvas.height - 100 - gapSize;
  const topHeight = Math.floor(Math.random() * (maxY - minY) + minY);

  hoops.push({
    x,
    topHeight,
    width: 20 // thin hoops
  });

  lastHoopX = x;
}

function update() {
  // Ball physics
  ball.velocity += ball.gravity;
  ball.y += ball.velocity;

  // Prevent going off-screen bottom
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.velocity = 0;
  }

  // Update hoops
  hoops.forEach((hoop) => {
    hoop.x -= hoopSpeed;
  });

  // Remove passed hoops & add new ones
  if (hoops[0].x + hoops[0].width < 0) {
    hoops.shift();
    score++;
    hoopCount++;
    if (hoopCount % 10 === 0 && gapSize > minGapSize) {
      gapSize = Math.max(minGapSize, gapSize - gapShrink);
      level++;
    }
    generateHoop(lastHoopX + hoopSpacing);
  }

  // Collision detection
  hoops.forEach((hoop) => {
    const inHoop = ball.x + ball.radius > hoop.x && ball.x - ball.radius < hoop.x + hoop.width;
    const hitTop = ball.y - ball.radius < hoop.topHeight;
    const hitBottom = ball.y + ball.radius > hoop.topHeight + gapSize;
    if (inHoop && (hitTop || hitBottom)) {
      gameOver();
    }
  });

  // Prevent going off the top
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.velocity = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ball
  ctx.beginPath();
  ctx.fillStyle = '#f1c40f';
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw hoops
  hoops.forEach((hoop) => {
    ctx.fillStyle = '#e74c3c';
    // Top part
    ctx.fillRect(hoop.x, 0, hoop.width, hoop.topHeight);
    // Bottom part
    ctx.fillRect(hoop.x, hoop.topHeight + gapSize, hoop.width, canvas.height);
  });

  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Level: ${level}`, 20, 60);
}

function gameLoop() {
  if (!started) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  started = false;
  alert(`Game Over!\nScore: ${score}`);
  document.getElementById('startScreen').style.display = 'flex';
}

function bounce() {
  if (!started) return;
  ball.velocity = ball.bouncePower;
}

// Controls
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') bounce();
});
canvas.addEventListener('click', bounce);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  bounce();
}, { passive: false });

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
