const canvas = document.querySelector("#gameCanvas");
const context = canvas.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const bestText = document.querySelector("#bestText");
const speedText = document.querySelector("#speedText");
const statusText = document.querySelector("#statusText");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const resetButton = document.querySelector("#resetButton");
const speedSlider = document.querySelector("#speedSlider");
const touchButtons = document.querySelectorAll(".touch-pad button");

const tileCount = 20;
const tileSize = canvas.width / tileCount;
const colors = ["#22c55e", "#b6ff4d", "#00b8a9", "#ffe45e", "#ff4fa3"];
const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem("snakeBestScore") || 0);
let running;
let paused;
let gameTimer;

function createGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  running = false;
  paused = false;
  placeFood();
  updateStats();
  statusText.textContent = "Press Start or use arrow keys.";
  draw();
}

function startGame() {
  if (running && !paused) {
    return;
  }

  running = true;
  paused = false;
  statusText.textContent = "Go! Eat the fruit.";
  restartTimer();
}

function pauseGame() {
  if (!running) {
    return;
  }

  paused = !paused;
  statusText.textContent = paused ? "Paused" : "Back in motion.";

  if (paused) {
    clearInterval(gameTimer);
  } else {
    restartTimer();
  }
}

function restartTimer() {
  clearInterval(gameTimer);
  gameTimer = setInterval(moveSnake, gameDelay());
}

function gameDelay() {
  return 190 - Number(speedSlider.value) * 24;
}

function moveSnake() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (hitWall(head) || hitSnake(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10 * Number(speedSlider.value);
    placeFood();
    updateStats();
  } else {
    snake.pop();
  }

  draw();
}

function hitWall(position) {
  return position.x < 0 || position.x >= tileCount || position.y < 0 || position.y >= tileCount;
}

function hitSnake(position) {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function endGame() {
  running = false;
  paused = false;
  clearInterval(gameTimer);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBestScore", bestScore);
  }

  updateStats();
  statusText.textContent = "Game over. Press Reset to try again.";
  draw(true);
}

function updateStats() {
  scoreText.textContent = score;
  bestText.textContent = bestScore;
  speedText.textContent = `${speedSlider.value}x`;
}

function changeDirection(newDirection) {
  const move = directions[newDirection];
  if (!move) {
    return;
  }

  const reversing = move.x + direction.x === 0 && move.y + direction.y === 0;
  if (reversing) {
    return;
  }

  nextDirection = move;

  if (!running) {
    startGame();
  }
}

function draw(gameOver = false) {
  drawBoard();
  drawFood();
  drawSnake();

  if (gameOver) {
    context.fillStyle = "rgba(16, 24, 40, 0.72)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "800 42px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
    context.font = "700 18px Inter, sans-serif";
    context.fillText(`Score ${score}`, canvas.width / 2, canvas.height / 2 + 28);
  }
}

function drawBoard() {
  context.fillStyle = "#101828";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < tileCount; y += 1) {
    for (let x = 0; x < tileCount; x += 1) {
      context.fillStyle = (x + y) % 2 === 0 ? "#182338" : "#142033";
      context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const inset = index === 0 ? 3 : 4;
    context.fillStyle = colors[index % colors.length];
    roundRect(
      segment.x * tileSize + inset,
      segment.y * tileSize + inset,
      tileSize - inset * 2,
      tileSize - inset * 2,
      8
    );
    context.fill();

    if (index === 0) {
      drawEyes(segment);
    }
  });
}

function drawEyes(head) {
  const centerX = head.x * tileSize + tileSize / 2;
  const centerY = head.y * tileSize + tileSize / 2;
  const offsetX = direction.x * 4;
  const offsetY = direction.y * 4;

  context.fillStyle = "#101828";
  context.beginPath();
  context.arc(centerX - 5 + offsetX, centerY - 5 + offsetY, 3, 0, Math.PI * 2);
  context.arc(centerX + 5 + offsetX, centerY - 5 + offsetY, 3, 0, Math.PI * 2);
  context.fill();
}

function drawFood() {
  const centerX = food.x * tileSize + tileSize / 2;
  const centerY = food.y * tileSize + tileSize / 2;

  context.shadowColor = "#ff4fa3";
  context.shadowBlur = 18;
  context.fillStyle = "#ff4fa3";
  context.beginPath();
  context.arc(centerX, centerY, tileSize * 0.34, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;

  context.fillStyle = "#ffe45e";
  context.beginPath();
  context.arc(centerX - 4, centerY - 5, 4, 0, Math.PI * 2);
  context.fill();
}

function roundRect(x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

document.addEventListener("keydown", event => {
  if (event.key === " ") {
    event.preventDefault();
    pauseGame();
    return;
  }
  changeDirection(event.key);
});

touchButtons.forEach(button => {
  button.addEventListener("click", () => changeDirection(button.dataset.direction));
});

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
resetButton.addEventListener("click", () => {
  clearInterval(gameTimer);
  createGame();
});
speedSlider.addEventListener("input", () => {
  updateStats();
  if (running && !paused) {
    restartTimer();
  }
});

createGame();
