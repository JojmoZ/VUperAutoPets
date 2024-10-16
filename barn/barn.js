const animalContainer = document.getElementById("animals");
const walkingSpeed = 50;
const frameDuration = 1000 / 60;
const gridSize = 10; // Adjust this based on your canvas size
let animationId;
let foodElement = null; // Variable to store the current food

const restrictedZones = [
  { x: 100, y: 100, width: 200, height: 150 },
  { x: 400, y: 300, width: 100, height: 100 },
  { x: 600, y: 150, width: 150, height: 200 },
  { x: 250, y: 450, width: 180, height: 120 },
  { x: 500, y: 500, width: 100, height: 150 },
  { x: 700, y: 50, width: 120, height: 180 },
  { x: 800, y: 400, width: 200, height: 100 },
  { x: 150, y: 600, width: 140, height: 140 },
  { x: 900, y: 250, width: 100, height: 100 },
  { x: 300, y: 750, width: 160, height: 100 },
];
function isInRestrictedZone(animalX, animalY, animalWidth, animalHeight) {
  return restrictedZones.some((zone) => {
    const zoneX = zone.x;
    const zoneY = zone.y;
    const zoneWidth = zone.width;
    const zoneHeight = zone.height;
    const isOverlapping =
      animalX < zoneX + zoneWidth &&
      animalX + animalWidth > zoneX &&
      animalY < zoneY + zoneHeight &&
      animalY + animalHeight > zoneY;

    return isOverlapping;
  });
}
// Get grid dimensions based on the canvas size
const rows = Math.floor(window.innerHeight / gridSize);
const cols = Math.floor(window.innerWidth / gridSize);

// Create grid (empty cells = 0, restricted zones = 1)
const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

// Populate grid with restricted zones
restrictedZones.forEach((zone) => {
  const startX = Math.floor(zone.x / gridSize);
  const startY = Math.floor(zone.y / gridSize);
  const endX = Math.floor((zone.x + zone.width) / gridSize);
  const endY = Math.floor((zone.y + zone.height) / gridSize);
  for (let i = startY; i <= endY; i++) {
    for (let j = startX; j <= endX; j++) {
      grid[i][j] = 1; // Mark as restricted
    }
  }
});

function getUserAnimals() {
  const storedAnimals = localStorage.getItem("ownedAnimals");
  return storedAnimals ? JSON.parse(storedAnimals) : [];
}

function createAnimal(animal) {
  const animalElement = document.createElement("img");
  animalElement.src = `../assets/${animal.name}.webp`;
  animalElement.className = "animal";
  animalElement.style.position = "absolute";
  animalElement.style.width = "50px"; // Adjust if necessary
  animalElement.style.height = "50px"; // Adjust if necessary

  let spawnX, spawnY;

  // Try to find a valid spawn position (outside restricted zones)
  do {
    spawnX = Math.random() * (window.innerWidth - 50);
    spawnY = Math.random() * (window.innerHeight - 60);
  } while (isInRestrictedZone(spawnX, spawnY, 50, 50)); // Retry if inside restricted zone

  animalElement.style.left = `${spawnX}px`;
  animalElement.style.top = `${spawnY}px`;

  animalElement.dataset.isMovingToFood = "false";
  animalContainer.appendChild(animalElement);
  roamAnimal(animalElement); // Start roaming
  return animalElement;
}
// A* pathfinding algorithm (unchanged)
function astar(start, end) {
  const openSet = [];
  const closedSet = [];
  openSet.push(start);

  while (openSet.length > 0) {
    let currentNode = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (
        openSet[i].f < currentNode.f ||
        (openSet[i].f === currentNode.f && openSet[i].h < currentNode.h)
      ) {
        currentNode = openSet[i];
      }
    }

    openSet.splice(openSet.indexOf(currentNode), 1);
    closedSet.push(currentNode);

    if (currentNode.row === end.row && currentNode.col === end.col) {
      let path = [];
      let temp = currentNode;
      while (temp) {
        path.push(temp);
        temp = temp.parent;
      }
      return path.reverse();
    }

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]; // Right, Down, Left, Up
    for (let dir of directions) {
      const neighborRow = currentNode.row + dir[0];
      const neighborCol = currentNode.col + dir[1];

      if (isValidCell(neighborRow, neighborCol)) {
        const neighbor = {
          row: neighborRow,
          col: neighborCol,
          g: currentNode.g + 1,
          h: heuristic({ row: neighborRow, col: neighborCol }, end),
          f: 0,
          parent: currentNode,
        };

        neighbor.f = neighbor.g + neighbor.h;

        if (
          closedSet.some(
            (node) => node.row === neighbor.row && node.col === neighbor.col
          )
        ) {
          continue;
        }

        const openSetNode = openSet.find(
          (node) => node.row === neighbor.row && node.col === neighbor.col
        );
        if (!openSetNode || neighbor.g < openSetNode.g) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return null;
}

// Helper function to calculate the heuristic (Manhattan distance)
function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Helper function to check if a cell is valid and not an obstacle
function isValidCell(row, col) {
  return (
    row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col] !== 1
  );
}
function roamAnimal(animal) {
  if (animal.dataset.isMovingToFood === "true") return; // Prevent roaming if moving to food

  const walkDuration = Math.random() * (7000 - 3000) + 3000; // Random walk duration
  const direction = Math.random() * 2 * Math.PI;
  const distance = Math.random() * 100 + 50; // Random movement distance

  const deltaX = Math.cos(direction) * distance;
  const deltaY = Math.sin(direction) * distance;

  const startX = parseFloat(animal.style.left) + animal.offsetWidth / 2; // Start position centered
  const startY = parseFloat(animal.style.top) + animal.offsetHeight / 2; // Start position centered
  const endX = Math.min(
    Math.max(startX + deltaX, animal.offsetWidth / 2),
    window.innerWidth - animal.offsetWidth / 2
  );
  const endY = Math.min(
    Math.max(startY + deltaY, animal.offsetHeight / 2),
    window.innerHeight - animal.offsetHeight / 2
  );

  // Check if the new position is within a restricted zone
  if (
    isInRestrictedZone(
      endX - animal.offsetWidth / 2,
      endY - animal.offsetHeight / 2,
      animal.offsetWidth,
      animal.offsetHeight
    )
  ) {
    setTimeout(() => roamAnimal(animal), 100); // Retry with a new direction
    return;
  }

  const duration = walkDuration / 1000;
  const startTime = performance.now();
  let roamAnimationId; // Store animation ID so it can be canceled

  function animateRoaming(currentTime) {
    if (animal.dataset.isMovingToFood === "true") {
      cancelAnimationFrame(roamAnimationId); // Stop roaming if animal is marked for food
      return;
    }

    const elapsedTime = (currentTime - startTime) / 1000;
    const progress = Math.min(elapsedTime / duration, 1);

    animal.style.left = `${
      startX + (endX - startX) * progress - animal.offsetWidth / 2
    }px`; // Adjust left to center
    animal.style.top = `${
      startY + (endY - startY) * progress - animal.offsetHeight / 2
    }px`; // Adjust top to center

    if (progress < 1) {
      roamAnimationId = requestAnimationFrame(animateRoaming);
    } else {
      setTimeout(() => {
        roamAnimal(animal); // Continue roaming
      }, Math.random() * 2000); // Random idle before next roam
    }
  }

  roamAnimationId = requestAnimationFrame(animateRoaming);
}

// Function to create food and make the closest animal go to it
function createFood(event) {
  if (foodElement) {
    foodElement.remove(); // Remove existing food before creating new one
  }

  foodElement = document.createElement("div");
  foodElement.className = "food";
  foodElement.style.position = "absolute";
  foodElement.style.width = "20px";
  foodElement.style.height = "20px";
  foodElement.style.backgroundColor = "yellow";
  foodElement.style.borderRadius = "50%";
  foodElement.style.left = `${event.clientX - 10}px`;
  foodElement.style.top = `${event.clientY - 10}px`;
  animalContainer.appendChild(foodElement);

  const foodRow = Math.floor(event.clientY / gridSize);
  const foodCol = Math.floor(event.clientX / gridSize);

  const animals = document.querySelectorAll(".animal");
  let closestAnimal = null;
  let minDistance = Infinity;

  animals.forEach((animal) => {
    const animalRow = Math.floor(parseFloat(animal.style.top) / gridSize);
    const animalCol = Math.floor(parseFloat(animal.style.left) / gridSize);

    const distance =
      Math.abs(animalRow - foodRow) + Math.abs(animalCol - foodCol);
    if (distance < minDistance) {
      minDistance = distance;
      closestAnimal = animal;
    }
  });

  if (closestAnimal) {
    closestAnimal.dataset.isMovingToFood = "true"; // Mark as moving to food

    // Immediately stop roaming by cancelling any ongoing animation
    cancelAnimationFrame(closestAnimal.roamAnimationId);

    // Introduce a 500ms delay before starting A* pathfinding
    setTimeout(() => {
      const start = {
        row: Math.floor(parseFloat(closestAnimal.style.top) / gridSize),
        col: Math.floor(parseFloat(closestAnimal.style.left) / gridSize),
      };
      const end = { row: foodRow, col: foodCol };

      const path = astar(start, end);
      if (path) {
        followPath(closestAnimal, path, () => {
          foodElement.remove(); // Remove food once eaten
          closestAnimal.dataset.isMovingToFood = "false"; // Resume roaming
          roamAnimal(closestAnimal); // Return to roaming after eating
        });
      }
    }, 500); // 500ms delay before pathfinding starts
  }
}

// Function to move animal along the path and trigger callback after reaching the food
function followPath(animal, path, callback) {
  let index = 0;

  function moveStep() {
    if (index >= path.length) {
      if (callback) callback(); // Trigger the callback (e.g., remove food and return to roaming)
      return;
    }

    const node = path[index];
    const nextX = node.col * gridSize;
    const nextY = node.row * gridSize;

    animal.style.left = `${nextX - animal.offsetWidth / 2}px`; // Adjust left to center
    animal.style.top = `${nextY - animal.offsetHeight / 2}px`; // Adjust top to center

    index++;

    setTimeout(moveStep, 100); // Adjust speed here
  }

  moveStep();
}

// Draw restricted zones (unchanged)
function drawRestrictedZones() {
  restrictedZones.forEach((zone) => {
    const zoneElement = document.createElement("div");
    zoneElement.className = "restricted-area";
    zoneElement.style.position = "absolute";
    zoneElement.style.left = `${zone.x}px`;
    zoneElement.style.top = `${zone.y}px`;
    zoneElement.style.width = `${zone.width}px`;
    zoneElement.style.height = `${zone.height}px`;
    animalContainer.appendChild(zoneElement);
  });
}
drawRestrictedZones();

// Create animals from stored data
const userAnimals = getUserAnimals();
userAnimals.forEach((animal) => {
  const animalElement = createAnimal(animal);
});

// Add event listener for food creation
animalContainer.addEventListener("dblclick", createFood);

