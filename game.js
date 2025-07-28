const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const startScreen = document.querySelector('.start-screen');
const scoreDisplay = document.getElementById('scoreValue');

let ball, hoops, score, scrollSpeed, gravity, jumpPower;
let gameRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function resetGame() {
  resizeCanvas();
  ball = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    radius: 20,
    dy: 0,
  };
  hoops = [];
  score = 0;
  scrollSpeed = 2;
  gravity = 0.4;
  jumpPower = -8;
  spawnHoop();
}

function spawnHoop() {
  const gapHeight = 120;
  const top = Math.random() * (canvas.height - gapHeight - 100) + 50;
  hoops.push({
    x: canvas.width,
    y: top,
    width: 20,
    gap: gapHeight,
    scored: false
  });
}

function update() {
  ball.dy += gravity;
  ball.y += ball.dy;

  hoops.forEach(hoop => {
    hoop.x -= scrollSpeed;
  });

  hoops = hoops.filter(hoop => hoop.x + hoop.width > 0);

  if (hoops.length === 0 || hoops[hoops.length - 1].x < canvas.width - 300) {
    spawnHoop();
  }

  hoops.forEach(hoop => {
    if (!hoop.scored && hoop.x + hoop.width < ball.x) {
      score++;
      scrollSpeed += 0.2;
      hoop.scored = true;
    }

    if (
      ball.x + ball.radius > hoop.x &&
      ball.x - ball.radius < hoop.x + hoop.width &&
      (ball.y - ball.radius < hoop.y || ball.y + ball.radius > hoop.y + hoop.gap)
    ) {
      endGame();
    }
  });

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    endGame();
  }

  scoreDisplay.textContent = score;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  hoops.forEach(hoop => {
    ctx.fillStyle = '#00FFCC';
    ctx.fillRect(hoop.x, 0, hoop.width, hoop.y);
    ctx.fillRect(hoop.x, hoop.y + hoop.gap, hoop.width, canvas.height);
  });
}

function loop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function bounce() {
  if (!gameRunning) return;
  ball.dy = jumpPower;
}

function endGame() {
  gameRunning = false;
  startScreen.style.display = 'flex';
}

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  resetGame();
  gameRunning = true;
  loop();
});

window.addEventListener('resize', resizeCanvas);
window.addEventListener('touchstart', bounce);
window.addEventListener('mousedown', bounce);
