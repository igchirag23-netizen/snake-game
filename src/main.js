

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const mobileControls = document.querySelector(".mobile-controls");

let state = createInitialState();
let intervalId = null;

buildBoard();
render();
startLoop();

document.addEventListener("keydown", handleKeydown);
pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});
restartButton.addEventListener("click", restartGame);

if (mobileControls) {
  mobileControls.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-direction]");
    if (!button) {
      return;
    }

    queueDirection(button.dataset.direction);
  });
}

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.append(cell);
  }

  boardElement.append(fragment);
}

function startLoop() {
  clearLoop();
  intervalId = window.setInterval(() => {
    if (state.isPaused || state.isGameOver || !state.hasStarted) {
      return;
    }

    state = moveSnake(state);
    render();
  }, TICK_MS);
}

function clearLoop() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
  }
}

function restartGame() {
  state = createInitialState();
  render();
  startLoop();
}

function handleKeydown(event) {
  const direction = mapKeyToDirection(event.key);
  if (!direction) {
    if (event.key === " ") {
      event.preventDefault();
      state = togglePause(state);
      render();
    } else if (event.key === "Enter" && state.isGameOver) {
      restartGame();
    }
    return;
  }

  event.preventDefault();
  queueDirection(direction);
}

function queueDirection(direction) {
  if (state.isGameOver) {
    restartGame();
  }

  state = {
    ...state,
    hasStarted: true,
    isPaused: false,
    pendingDirection: nextDirection(state.direction, direction),
  };
  render();
}

function render() {
  scoreElement.textContent = String(state.score);
  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
  statusElement.textContent = getStatusText();

  const snakeKeys = new Set(state.snake.map((segment) => toKey(segment)));
  const headKey = toKey(state.snake[0]);
  const foodKey = toKey(state.food);
  const cells = boardElement.children;

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const index = y * BOARD_SIZE + x;
      const cell = cells[index];
      const key = `${x},${y}`;
      cell.className = "cell";

      if (snakeKeys.has(key)) {
        cell.classList.add("cell--snake");
      }

      if (key === headKey) {
        cell.classList.add("cell--head");
      } else if (key === foodKey) {
        cell.classList.add("cell--food");
      }
    }
  }
}

function getStatusText() {
  if (state.isGameOver) {
    return "Game over. Press Restart or any direction to play again.";
  }

  if (state.isPaused) {
    return "Paused. Press Space or Resume to continue.";
  }

  if (!state.hasStarted && state.score === 0) {
    return "Use arrow keys or WASD to start.";
  }

  return "Eat food, avoid walls, and don’t run into yourself.";
}

function mapKeyToDirection(key) {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}
