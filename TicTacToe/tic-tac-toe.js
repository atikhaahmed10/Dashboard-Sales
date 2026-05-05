const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.querySelector("#statusText");
const newRoundButton = document.querySelector("#newRoundButton");
const resetScoreButton = document.querySelector("#resetScoreButton");
const scoreX = document.querySelector("#scoreX");
const scoreO = document.querySelector("#scoreO");
const scoreDraw = document.querySelector("#scoreDraw");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let scores = {
  X: 0,
  O: 0,
  draw: 0
};

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || board[index] !== "") {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const result = getGameResult();

  if (result.winner) {
    finishGame(result.winner, result.line);
    return;
  }

  if (result.draw) {
    finishDraw();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function getGameResult() {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  return { draw: board.every(Boolean) };
}

function finishGame(winner, line) {
  gameActive = false;
  scores[winner] += 1;
  statusText.textContent = `Player ${winner} wins!`;
  line.forEach(index => cells[index].classList.add("win"));
  cells.forEach(cell => {
    cell.disabled = true;
  });
  updateScores();
}

function finishDraw() {
  gameActive = false;
  scores.draw += 1;
  statusText.textContent = "It is a draw!";
  updateScores();
}

function startNewRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X goes first";

  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.dataset.index = index;
    cell.className = "cell";
  });
}

function resetScore() {
  scores = {
    X: 0,
    O: 0,
    draw: 0
  };
  updateScores();
  startNewRound();
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

cells.forEach((cell, index) => {
  cell.dataset.index = index;
  cell.addEventListener("click", handleCellClick);
});

newRoundButton.addEventListener("click", startNewRound);
resetScoreButton.addEventListener("click", resetScore);

startNewRound();
