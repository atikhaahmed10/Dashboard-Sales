const LEVELS = {
  basic: { label: "Basic", clues: 42 },
  intermediate: { label: "Intermediate", clues: 34 },
  advanced: { label: "Advanced", clues: 27 }
};

const boardElement = document.querySelector("#sudokuBoard");
const numberPadElement = document.querySelector("#numberPad");
const levelText = document.querySelector("#levelText");
const filledText = document.querySelector("#filledText");
const newPuzzleButton = document.querySelector("#newPuzzleButton");
const checkButton = document.querySelector("#checkButton");
const solveButton = document.querySelector("#solveButton");
const difficultyButtons = document.querySelectorAll(".difficulty-button");

let activeLevel = "basic";
let puzzle = [];
let solution = [];
let selectedCell = null;

function shuffled(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pattern(row, col) {
  return (row * 3 + Math.floor(row / 3) + col) % 9;
}

function makeSolvedGrid() {
  const rowGroups = shuffled([0, 1, 2]);
  const colGroups = shuffled([0, 1, 2]);
  const rows = rowGroups.flatMap(group => shuffled([0, 1, 2]).map(row => group * 3 + row));
  const cols = colGroups.flatMap(group => shuffled([0, 1, 2]).map(col => group * 3 + col));
  const nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  return rows.map(row => cols.map(col => nums[pattern(row, col)]));
}

function makePuzzle(grid, clues) {
  const nextPuzzle = grid.map(row => [...row]);
  const positions = shuffled(Array.from({ length: 81 }, (_, index) => index));

  for (let i = 0; i < 81 - clues; i += 1) {
    const row = Math.floor(positions[i] / 9);
    const col = positions[i] % 9;
    nextPuzzle[row][col] = 0;
  }

  return nextPuzzle;
}

function generatePuzzle() {
  solution = makeSolvedGrid();
  puzzle = makePuzzle(solution, LEVELS[activeLevel].clues);
  selectedCell = null;
  renderBoard();
  updateStats();
}

function getCell(row, col) {
  return boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function renderBoard() {
  boardElement.innerHTML = "";

  puzzle.forEach((rowValues, row) => {
    rowValues.forEach((value, col) => {
      const input = document.createElement("input");
      input.className = "cell";
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.autocomplete = "off";
      input.dataset.row = row;
      input.dataset.col = col;
      input.value = value === 0 ? "" : value;

      if (value !== 0) {
        input.readOnly = true;
        input.classList.add("given");
      }

      input.addEventListener("focus", () => selectCell(input));
      input.addEventListener("input", event => handleInput(event, input));
      input.addEventListener("keydown", event => handleKeys(event, input));
      boardElement.appendChild(input);
    });
  });
}

function renderPad() {
  numberPadElement.innerHTML = "";

  [...Array(9)].forEach((_, index) => {
    const number = index + 1;
    const button = document.createElement("button");
    button.className = "pad-button";
    button.type = "button";
    button.textContent = number;
    button.setAttribute("aria-label", `Enter ${number}`);
    button.addEventListener("click", () => fillSelected(number));
    numberPadElement.appendChild(button);
  });

  const clearButton = document.createElement("button");
  clearButton.className = "pad-button";
  clearButton.type = "button";
  clearButton.textContent = "X";
  clearButton.setAttribute("aria-label", "Clear cell");
  clearButton.addEventListener("click", () => fillSelected(""));
  numberPadElement.appendChild(clearButton);
}

function selectCell(cell) {
  selectedCell = cell;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const value = cell.value;

  document.querySelectorAll(".cell").forEach(item => {
    const itemRow = Number(item.dataset.row);
    const itemCol = Number(item.dataset.col);
    const sameBox = Math.floor(itemRow / 3) === Math.floor(row / 3) && Math.floor(itemCol / 3) === Math.floor(col / 3);

    item.classList.toggle("selected", item === cell);
    item.classList.toggle("peer", item !== cell && (itemRow === row || itemCol === col || sameBox));
    item.classList.toggle("match", value !== "" && item.value === value);
  });
}

function handleInput(event, cell) {
  const cleanValue = event.target.value.replace(/[^1-9]/g, "").slice(0, 1);
  cell.value = cleanValue;
  cell.classList.remove("error", "correct");
  selectCell(cell);
  updateStats();
}

function handleKeys(event, cell) {
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const moves = {
    ArrowUp: [row - 1, col],
    ArrowDown: [row + 1, col],
    ArrowLeft: [row, col - 1],
    ArrowRight: [row, col + 1]
  };

  if (!moves[event.key]) {
    return;
  }

  event.preventDefault();
  const [nextRow, nextCol] = moves[event.key];
  getCell(Math.max(0, Math.min(8, nextRow)), Math.max(0, Math.min(8, nextCol))).focus();
}

function fillSelected(value) {
  if (!selectedCell || selectedCell.readOnly) {
    return;
  }

  selectedCell.value = value;
  selectedCell.classList.remove("error", "correct");
  selectCell(selectedCell);
  updateStats();
}

function updateStats() {
  const filled = [...document.querySelectorAll(".cell")].filter(cell => cell.value !== "").length;
  levelText.textContent = LEVELS[activeLevel].label;
  filledText.textContent = `${filled} / 81`;
  filledText.classList.remove("message");
}

function checkPuzzle() {
  let emptyCount = 0;
  let errorCount = 0;

  document.querySelectorAll(".cell").forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = Number(cell.value);

    cell.classList.remove("error", "correct");

    if (!value) {
      emptyCount += 1;
      return;
    }

    if (value !== solution[row][col]) {
      errorCount += 1;
      cell.classList.add("error");
    } else if (!cell.classList.contains("given")) {
      cell.classList.add("correct");
    }
  });

  if (errorCount === 0 && emptyCount === 0) {
    filledText.textContent = "Complete";
    filledText.classList.add("message");
  } else {
    updateStats();
  }
}

function solvePuzzle() {
  document.querySelectorAll(".cell").forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    cell.value = solution[row][col];
    cell.classList.remove("error");
    if (!cell.classList.contains("given")) {
      cell.classList.add("correct");
    }
  });
  filledText.textContent = "Solved";
  filledText.classList.add("message");
}

difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeLevel = button.dataset.level;
    difficultyButtons.forEach(item => item.classList.toggle("active", item === button));
    generatePuzzle();
  });
});

newPuzzleButton.addEventListener("click", generatePuzzle);
checkButton.addEventListener("click", checkPuzzle);
solveButton.addEventListener("click", solvePuzzle);

renderPad();
generatePuzzle();
