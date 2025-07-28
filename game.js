const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ball, hoops, score, gameSpeed, gameRunning, hoopTimer, hoopCount, gapSize;

const gravity = 0.5;
const bouncePower = -9;
const hoopSpacing = 250;
const minGapSize = 90;
const gapShrinkRate = 10;
const initialGapSize = 200;

function resetGame() {
  ball = {
    x: 100,
    y: canvas.height / 2,
    radius: 15,
    dy: 0
  };
  hoops = [];
  score = 0;
  hoopCount = 0;
  gameSpeed = 2;
  gapSize = initialGapSize;
  hoopTimer = 0;
  gameRunning = true;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcc00";
  ctx.fill();
  ctx.closePath();
}

function drawHoop(hoop) {
  ctx.fillStyle = "#00eaff";
  const postWidth = 10;
  ctx.fillRect(hoop.x, 0, postWidth, hoop.top);
  ctx.fillRect(hoop.x, hoop.bottom, postWidth, canvas.height - hoop.bottom);
}

function createHoop() {
  const minHeight = 50;
  const maxHeight = canvas.height - gapSize - 50;
  const top = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  const bottom = top + gapSize;

  hoops.push({ x: canvas.width, top, bottom });
}

function updateHoops() {
  for (let i = 0; i < hoops.length; i++) {
    hoops[i].x -= gameSpeed;

    if (!hoops[i].scored && hoops[i].x + 20 < ball.x) {
      hoops[i].scored = true;
      score++;
      hoopCount++;

      if (hoopCount % 10 === 0 && gapSize > minGapSize) {
        gapSize -= gapShrinkRate;
      }

      if (hoopCount % 15 === 0) {
        gameSpeed += 0.5;
      }
    }

    if (hoops[i].x + 20 < 0) {
      hoops.splice(i, 1);
      i--;
    }
  }

  hoopTimer++;
  if (hoopTimer > hoopSpacing) {
    createHoop();
    hoopTimer = 0;
  }
}

function checkCollision() {
  for (let hoop of hoops) {
    const inHoopX = ball.x + ball.radius > hoop.x && ball.x - ball.radius < hoop.x + 10;
    const hitTop = ball.y - ball.radius < hoop.top;
    const hitBottom = ball.y + ball.radius > hoop.bottom;

    if (inHoopX && (hitTop || hitBottom)) {
      return true;
    }
  }

  return ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height;
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function update() {
  if (!gameRunning) return;

  ball.dy += gravity;
  ball.y += ball.dy;

  updateHoops();

  if (checkCollision()) {
    gameRunning = false;
    showStartScreen("Game Over! Tap to restart");
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  hoops.forEach(drawHoop);
  drawScore();
}

function loop() {
  update();
  requestAnimationFrame(loop);
}

function bounce() {
  if (gameRunning) {
    ball.dy = bouncePower;
  }
}

function showStartScreen(text = "Tap to Start") {
  const overlay = document.getElementById("startOverlay");
  overlay.style.display = "flex";
  overlay.innerText = text;
}

function hideStartScreen() {
  const overlay = document.getElementById("startOverlay");
  overlay.style.display = "none";
}

// Now listen for tap/clicks anywhere
function handleTap() {
  if (!gameRunning) {
    hideStartScreen();
    resetGame();
  } else {
    bounce();
  }
}

document.addEventListener("mousedown", handleTap);
document.addEventListener("touchstart", handleTap);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

showStartScreen();
loop();
