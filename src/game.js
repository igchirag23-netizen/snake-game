const BOARD_SIZE = 16;
const INITIAL_DIRECTION = "right";
const TICK_MS = 140;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function createInitialSnake() {
  const mid = Math.floor(BOARD_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

function createInitialState(random = Math.random) {
  const snake = createInitialSnake();
  return {
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, random),
    score: 0,
    isGameOver: false,
    isPaused: false,
    hasStarted: false,
  };
}

function nextDirection(currentDirection, requestedDirection) {
  if (!requestedDirection || !(requestedDirection in DIRECTIONS)) {
    return currentDirection;
  }

  if (OPPOSITES[currentDirection] === requestedDirection) {
    return currentDirection;
  }

  return requestedDirection;
}

function moveSnake(state, random = Math.random) {
  if (state.isGameOver) {
    return state;
  }

  const direction = nextDirection(state.direction, state.pendingDirection);
  const offset = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + offset.x, y: head.y + offset.y };
  const willEat = positionsEqual(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (hitsWall(nextHead) || hitsSnake(nextHead, bodyToCheck)) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      isGameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!willEat) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: willEat ? placeFood(nextSnake, random) : state.food,
    score: willEat ? state.score + 1 : state.score,
  };
}

function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

function placeFood(snake, random = Math.random) {
  const occupied = new Set(snake.map((segment) => toKey(segment)));
  const available = [];

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const candidate = { x, y };
      if (!occupied.has(toKey(candidate))) {
        available.push(candidate);
      }
    }
  }

  if (available.length === 0) {
    return snake[0];
  }

  const index = Math.floor(random() * available.length);
  return available[index];
}

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function hitsWall(position) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= BOARD_SIZE ||
    position.y >= BOARD_SIZE
  );
}

function hitsSnake(position, snake) {
  return snake.some((segment) => positionsEqual(segment, position));
}

function toKey(position) {
  return `${position.x},${position.y}`;
}
