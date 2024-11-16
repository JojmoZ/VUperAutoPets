const animalContainer = document.getElementById("animals");
const walkingSpeed = 50;
const frameDuration = 1000 / 60;
const gridSize = 10;
let animationId;
let foodElement = null;
let scaleX, scaleY;
const restrictedZones = [
  { x: 0, y: 0, width: 50, height: 1080 },
  { x: 0, y: 0, width: 1920, height: 90 },
  { x: 1850, y: 0, width: 70, height: 1080 },
  { x: 1410, y: 60, width: 245, height: 70 },
  { x: 1635, y: 150, width: 14, height: 140 },
  { x: 1610, y: (140+140), width: (1920-1610), height: 100 },
  { x: 1169, y: (140+140), width: 250, height: 100 },
  { x: 1635, y: (140+90), width: (1920-1635), height: 50 },
  { x: 1169, y: (140+90), width: 245, height: 50 },
  { x: (1169+225), y: 150, width: 16, height: 100 },
  { x: 0, y: 0, width: 320, height: 230 },
  { x: 390, y: 0, width: 420, height: 230 },
  { x: 915, y: 0, width: 245, height: 320 },
  { x: 500, y: 200, width: 330, height: 120 },
  { x: 0, y: 420, width: 445, height: 35 },
  { x: 435, y: 420, width: 15, height: 175 },
  { x: 435, y: 650, width: 15, height: 180 },
  { x: 0, y: 880, width: 280, height: 90 },
  { x: 270, y: 850, width: 330, height: 100 },
  { x: 295, y: 820, width: 150, height: 80 },
  { x: 270, y: 850, width: 10, height: 80 },
  { x: 600, y: 820, width: 20, height: 150 },
  { x: 670, y: 820, width: 20, height: 150 },
  { x: 690, y: 835, width: 90, height: 120 },
  { x: 780, y: 835, width: 100, height: 100 },
  { x: 820, y: 935, width: 15, height: 150 },
  { x: 1350, y: 915, width: (1920-1350), height: 160 },
  { x: 800, y: 815, width: 200, height: 60 },
  { x: 890, y: 780, width: 180, height: 70 },
  { x: 970, y: 750, width: 100, height: 70 },
  { x: 990, y: 730, width: 100, height: 70 },
  { x: 1010, y: 710, width: 100, height: 70 },
  { x: 1040, y: 680, width: 100, height: 60 },
  { x: 1065, y: 590, width: 100, height: 120 },
  { x: 1065, y: 450, width: 100, height: 120 },
  { x: 1040, y: 430, width: 170, height: 75 },
  { x: 1060, y: 410, width: 130, height: 130 },
  { x: 1085, y: 190, width: 80, height: 300 },
  { x: 1110, y: 160, width: 80, height: 100 },
  { x: 1130, y: 140, width: 80, height: 100 },
  { x: 1130, y: 140, width: 100, height: 30 },
  { x: 1160, y: 0, width: 100, height: 150 },
  // { x: 230, y: 540, width: 120, height: 80 },
  // { x: 210, y: 560, width: 10, height: 80 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 500, y: 500, width: 100, height: 150 },
  // { x: 700, y: 50, width: 120, height: 180 },
  // { x: 800, y: 400, width: 200, height: 100 },
  // { x: 150, y: 600, width: 140, height: 140 },
  // { x: 900, y: 250, width: 100, height: 100 },
  // { x: 300, y: 750, width: 160, height: 100 }
];
function updateScalingFactors() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  scaleX = barnRect.width / 1920; // Scale based on original barn width
  scaleY = barnRect.height / 1080; // Scale based on original barn height
}
function isInRestrictedZone(animalX, animalY, animalWidth, animalHeight) {
  updateScalingFactors(); // Ensure scaling is updated before checking

  return restrictedZones.some((zone) => {
    const zoneX = zone.x * scaleX;
    const zoneY = zone.y * scaleY;
    const zoneWidth = zone.width * scaleX;
    const zoneHeight = zone.height * scaleY;
    return (
      animalX < zoneX + zoneWidth &&
      animalX + animalWidth > zoneX &&
      animalY < zoneY + zoneHeight &&
      animalY + animalHeight > zoneY
    );
  });
}

const rows = Math.floor(window.innerHeight / gridSize);
const cols = Math.floor(window.innerWidth / gridSize);
const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
restrictedZones.forEach((zone) => {
  const startX = Math.floor(zone.x / gridSize);
  const startY = Math.floor(zone.y / gridSize);
  const endX = Math.floor((zone.x + zone.width) / gridSize);
  const endY = Math.floor((zone.y + zone.height) / gridSize);
  for (let i = startY; i <= endY; i++) {
    if (i >= rows) continue; // Ensure index is within bounds
    for (let j = startX; j <= endX; j++) {
      if (j >= cols) continue; // Ensure index is within bounds
      grid[i][j] = 1;
    }
  }
});

function getUserAnimals() {
  const storedAnimals = localStorage.getItem("ownedAnimals");
  return storedAnimals ? JSON.parse(storedAnimals) : [];
}

function createAnimal(animal) {
  const animalElement = document.createElement("img");
  animalElement.src = `../assets/Animals/${animal.name}.webp`;
  animalElement.className = "animal";
  animalElement.style.position = "absolute";
  animalElement.style.width = "3.125rem"; // Use relative unit
  animalElement.style.height = "3.125rem"; // Use relative unit
  animalElement.dataset.name = animal.name;
  animalElement.dataset.attack = animal.attack;
  animalElement.dataset.health = animal.health;
  animalElement.dataset.cost = animal.cost;
  let spawnX, spawnY;
  do {
    spawnX = Math.random() * (animalContainer.clientWidth - 50);
    spawnY = Math.random() * (animalContainer.clientHeight - 60);
  } while (isInRestrictedZone(spawnX, spawnY, 50, 50));
  animalElement.style.left = `${spawnX}px`;
  animalElement.style.top = `${spawnY}px`;
  animalElement.dataset.isMovingToFood = "false";
  animalElement.addEventListener("dragstart", (event) =>
    event.preventDefault()
  );
  animalContainer.appendChild(animalElement);
  roamAnimal(animalElement);
  return animalElement;
}

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
      [-1, 1],
      [-1, -1],
      [1, 1],
      [1, -1],
    ];

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

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function isValidCell(row, col) {
  return (
    row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col] !== 1
  );
}

function roamAnimal(animal) {
  if (animal.dataset.isMovingToFood === "true") return;

  const walkDuration = Math.random() * (7000 - 3000) + 3000;
  const direction = Math.random() * 2 * Math.PI;
  const distance = Math.random() * 100 + 50;
  const deltaX = Math.cos(direction) * distance;
  const deltaY = Math.sin(direction) * distance;
  const startX = parseFloat(animal.style.left) + animal.offsetWidth / 2;
  const startY = parseFloat(animal.style.top) + animal.offsetHeight / 2;
  const endX = Math.min(
    Math.max(startX + deltaX, animal.offsetWidth / 2),
    animalContainer.clientWidth - animal.offsetWidth / 2
  );
  const endY = Math.min(
    Math.max(startY + deltaY, animal.offsetHeight / 2),
    animalContainer.clientHeight - animal.offsetHeight / 2
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
    // Try a new direction if restricted
    setTimeout(() => roamAnimal(animal), 100);
    return;
  }

  const duration = walkDuration / 1000;
  const startTime = performance.now();
  let roamAnimationId;

  function animateRoaming(currentTime) {
    if (animal.dataset.isMovingToFood === "true") {
      cancelAnimationFrame(roamAnimationId);
      return;
    }

    const elapsedTime = (currentTime - startTime) / 1000;
    const progress = Math.min(elapsedTime / duration, 1);

    const nextX = startX + (endX - startX) * progress - animal.offsetWidth / 2;
    const nextY = startY + (endY - startY) * progress - animal.offsetHeight / 2;

    // Check at each step if moving towards restricted zone
    if (
      isInRestrictedZone(nextX, nextY, animal.offsetWidth, animal.offsetHeight)
    ) {
      setTimeout(() => roamAnimal(animal), 100); // Retry with a new path
      return;
    }

    animal.style.left = `${nextX}px`;
    animal.style.top = `${nextY}px`;

    if (progress < 1) {
      roamAnimationId = requestAnimationFrame(animateRoaming);
    } else {
      setTimeout(() => roamAnimal(animal), Math.random() * 2000);
    }
  }
  roamAnimationId = requestAnimationFrame(animateRoaming);
}

function createFood(event) {
  if (foodElement) {
    return; // If food already exists, do not create a new one
  }
  const foodX = event.clientX - 10;
  const foodY = event.clientY - 10;
  const foodWidth = 20; // Assuming food width is 20px
  const foodHeight = 20; // Assuming food height is 20px

  if (isInRestrictedZone(foodX, foodY, foodWidth, foodHeight)) {
    return;
  }

  foodElement = document.createElement("div");
  foodElement.className = "food";
  foodElement.style.position = "absolute";
  foodElement.style.width = "1.25rem"; // Use relative unit
  foodElement.style.height = "1.25rem"; // Use relative unit
  foodElement.style.backgroundColor = "yellow";
  // foodElement.style.backgroundImage = '../assets/Pizza.webp'
  foodElement.style.borderRadius = "50%";
  foodElement.style.left = `${foodX}px`;
  foodElement.style.top = `${foodY}px`;
  animalContainer.appendChild(foodElement);
  const foodRow = Math.floor(event.clientY / gridSize);
  const foodCol = Math.floor(event.clientX / gridSize);
  const animals = document.querySelectorAll(".animal");
  let closestAnimal = null;
  let minDistance = Infinity;
  animals.forEach((animal) => {
    const animalRow = Math.floor(
      (parseFloat(animal.style.top) + animal.offsetHeight / 2) / gridSize
    );
    const animalCol = Math.floor(
      (parseFloat(animal.style.left) + animal.offsetWidth / 2) / gridSize
    );

    const distance =
      Math.abs(animalRow - foodRow) + Math.abs(animalCol - foodCol);
    if (distance < minDistance) {
      minDistance = distance;
      closestAnimal = animal;
    }
  });

  if (closestAnimal) {
    closestAnimal.dataset.isMovingToFood = "true";
    cancelAnimationFrame(closestAnimal.roamAnimationId);
    setTimeout(() => {
      const start = {
        row: Math.floor(
          (parseFloat(closestAnimal.style.top) +
            closestAnimal.offsetHeight / 2) /
            gridSize
        ),
        col: Math.floor(
          (parseFloat(closestAnimal.style.left) +
            closestAnimal.offsetWidth / 2) /
            gridSize
        ),
      };
      const end = { row: foodRow, col: foodCol };

      const path = astar(start, end);
      if (path) {
        followPath(closestAnimal, path, () => {
          foodElement.remove();
          foodElement = null; // Reset foodElement after being eaten
          closestAnimal.dataset.isMovingToFood = "false";
          roamAnimal(closestAnimal);
        });
      }
    }, 200);
  }
}

function followPath(animal, path, callback) {
  let index = 0;
  const speed = 0.7;
  function moveStep() {
    if (index >= path.length) {
      if (callback) callback();
      return;
    }
    const node = path[index];
    const nextX = node.col * gridSize + gridSize / 2;
    const nextY = node.row * gridSize + gridSize / 2;
    const currentX = parseFloat(animal.style.left) + animal.offsetWidth / 2;
    const currentY = parseFloat(animal.style.top) + animal.offsetHeight / 2;
    const deltaX = nextX - currentX;
    const deltaY = nextY - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > speed) {
      const moveX = (deltaX / distance) * speed;
      const moveY = (deltaY / distance) * speed;
      animal.style.left = `${currentX + moveX - animal.offsetWidth / 2}px`;
      animal.style.top = `${currentY + moveY - animal.offsetHeight / 2}px`;
      requestAnimationFrame(moveStep);
    } else {
      animal.style.left = `${nextX - animal.offsetWidth / 2}px`;
      animal.style.top = `${nextY - animal.offsetHeight / 2}px`;
      index++;
      setTimeout(moveStep, 10);
    }
  }
  moveStep();
}

function drawRestrictedZones() {
  // Clear previously drawn restricted areas
  const existingZones = document.querySelectorAll(".restricted-area");
  existingZones.forEach((zone) => zone.remove());

  restrictedZones.forEach((zone) => {
    const zoneElement = document.createElement("div");
    zoneElement.className = "restricted-area";
    zoneElement.style.position = "absolute";
    zoneElement.style.left = `${zone.x * scaleX}px`;
    zoneElement.style.top = `${zone.y * scaleY}px`;
    zoneElement.style.width = `${zone.width * scaleX}px`;
    zoneElement.style.height = `${zone.height * scaleY}px`;
    animalContainer.appendChild(zoneElement);
  });
}

drawRestrictedZones();

function updateRestrictedZones() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  const scaleX = barnRect.width / 1920; // Assuming 1920 is the original width
  const scaleY = barnRect.height / 1080; // Assuming 1080 is the original height

  const restrictedAreaElements = document.querySelectorAll(".restricted-area");
  restrictedAreaElements.forEach((element, index) => {
    const zone = restrictedZones[index];
    element.style.left = `${zone.x * scaleX}px`;
    element.style.top = `${zone.y * scaleY}px`;
    element.style.width = `${zone.width * scaleX}px`;
    element.style.height = `${zone.height * scaleY}px`;
  });
}

function updateAnimalSizes() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  const scaleX = barnRect.width / 1920; // Assuming 1920 is the original width
  const scaleY = barnRect.height / 1080; // Assuming 1080 is the original height

  const animals = document.querySelectorAll(".animal");
  animals.forEach((animal) => {
    const originalWidth = 50; // Original width in pixels
    const originalHeight = 50; // Original height in pixels
    animal.style.width = `${originalWidth * scaleX}px`;
    animal.style.height = `${originalHeight * scaleY}px`;

    const left = parseFloat(animal.style.left);
    const top = parseFloat(animal.style.top);
    animal.style.left = `${left * scaleX}px`;
    animal.style.top = `${top * scaleY}px`;
  });
}

function updateCoordinates() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  const scaleX = barnRect.width / 1920; // Assuming 1920 is the original width
  const scaleY = barnRect.height / 1080; // Assuming 1080 is the original height

  const animals = document.querySelectorAll(".animal");
  animals.forEach((animal) => {
    const left = parseFloat(animal.style.left) / scaleX;
    const top = parseFloat(animal.style.top) / scaleY;
    animal.style.left = `${left}px`;
    animal.style.top = `${top}px`;
  });

  const restrictedAreaElements = document.querySelectorAll(".restricted-area");
  restrictedAreaElements.forEach((element, index) => {
    const zone = restrictedZones[index];
    element.style.left = `${zone.x * scaleX}px`;
    element.style.top = `${zone.y * scaleY}px`;
    element.style.width = `${zone.width * scaleX}px`;
    element.style.height = `${zone.height * scaleY}px`;
  });
}

window.addEventListener("resize", () => {
  updateScalingFactors();
  resetGrid();
  drawRestrictedZones();
  // updateAnimalSizes();
  // updateCoordinates();
});
updateScalingFactors();
resetGrid();
drawRestrictedZones();
// updateAnimalSizes();
// updateCoordinates();

const userAnimals = getUserAnimals();
userAnimals.forEach((animal) => {
  const animalElement = createAnimal(animal);
});
animalContainer.addEventListener("dblclick", createFood);
function resetGrid() {
  updateScalingFactors();
  grid.forEach((row) => row.fill(0));
  restrictedZones.forEach((zone) => {
    const startX = Math.floor((zone.x * scaleX) / gridSize);
    const startY = Math.floor((zone.y * scaleY) / gridSize);
    const endX = Math.floor(((zone.x + zone.width) * scaleX) / gridSize);
    const endY = Math.floor(((zone.y + zone.height) * scaleY) / gridSize);

    for (let i = startY; i <= endY; i++) {
      for (let j = startX; j <= endX; j++) {
        if (i >= 0 && i < rows && j >= 0 && j < cols) grid[i][j] = 1;
      }
    }
  });
}

let followAnimal = null;

function showStatWindow(animal) {
  const statWindow = document.getElementById("statWindow");
  const animalName = document.getElementById("animalName");
  const animalAttack = document.getElementById("animalAttack");
  const animalHealth = document.getElementById("animalHealth");
  const animalCost = document.getElementById("animalCost");

  animalName.textContent = `Name: ${animal.dataset.name}`;
  animalAttack.textContent = `Attack: ${animal.dataset.attack}`;
  animalHealth.textContent = `Health: ${animal.dataset.health}`;
  animalCost.textContent = `Cost: ${animal.dataset.cost}`;

  statWindow.style.display = "block";
}

function hideStatWindow() {
  const statWindow = document.getElementById("statWindow");
  statWindow.style.display = "none";
}

function zoomToAnimal(animal) {
  followAnimal = animal;
  updateCameraPosition();
}

function updateCameraPosition() {
  if (!followAnimal) return;

  const animalRect = followAnimal.getBoundingClientRect();
  const containerRect = animalContainer.getBoundingClientRect();
  const zoomX =
    animalRect.left -
    containerRect.left -
    containerRect.width / 2 +
    animalRect.width / 2;
  const zoomY =
    animalRect.top -
    containerRect.top -
    containerRect.height / 2 +
    animalRect.height / 2;

  animalContainer.style.transform = `translate(${-zoomX}px, ${-zoomY}px) scale(2)`;
  animalContainer.style.transition = "transform 0.1s ease";

  requestAnimationFrame(updateCameraPosition);
}

animalContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("animal")) {
    const animal = event.target;
    zoomToAnimal(animal);
    showStatWindow(animal);
  } else {
    followAnimal = null;
    animalContainer.style.transform = "translate(0, 0) scale(1)";
    hideStatWindow();
  }
});
