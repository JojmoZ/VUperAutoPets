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
  { x: 1635, y: 160, width: 14, height: 140 },
  { x: 1610, y: 140 + 140, width: 1920 - 1610, height: 100 },
  { x: 1169, y: 140 + 140, width: 250, height: 100 },
  { x: 969, y: 140 + 140, width: 120, height: 100 },
  { x: 949, y: 260, width: 120, height: 100 },
  { x: 929, y: 240, width: 120, height: 100 },
  { x: 400, y: 140, width: 120, height: 100 },
  { x: 420, y: 160, width: 120, height: 100 },
  { x: 440, y: 180, width: 120, height: 100 },
  { x: 460, y: 200, width: 120, height: 100 },
  { x: 890, y: 220, width: 100, height: 100 },
  { x: 1635, y: 140 + 90, width: 1920 - 1635, height: 50 },
  { x: 1169, y: 140 + 90, width: 245, height: 50 },
  { x: 1169 + 225, y: 160, width: 16, height: 100 },
  { x: 0, y: 0, width: 320, height: 230 },
  { x: 390, y: 0, width: 440, height: 230 },
  { x: 915 - 25, y: 0, width: 245 + 25, height: 320 },
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
  { x: 1350, y: 915, width: 1920 - 1350, height: 160 },
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
  { x: 1160, y: 0, width: 100, height: 150 }
];
function updateScalingFactors() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  scaleX = barnRect.width / 1920; 
  scaleY = barnRect.height / 1080; 
}
function isInRestrictedZone(animalX, animalY, animalWidth, animalHeight) {
  updateScalingFactors(); 

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
    if (i >= rows) continue; 
    for (let j = startX; j <= endX; j++) {
      if (j >= cols) continue; 
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
  animalElement.style.width = "3.125rem"; 
  animalElement.style.height = "3.125rem"; 
  animalElement.dataset.name = animal.name;
  animalElement.dataset.attack = animal.attack;
  animalElement.dataset.health = animal.health;
  animalElement.dataset.cost = animal.cost;
  animalElement.dataset.color = animal.color; 
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

function moveOutOfRestrictedZone(animal) {
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

  let bestDirection = null;
  let maxDistance = 0;

  directions.forEach((dir) => {
    const deltaX = dir[0] * gridSize;
    const deltaY = dir[1] * gridSize;
    const newX = parseFloat(animal.style.left) + deltaX;
    const newY = parseFloat(animal.style.top) + deltaY;

    if (
      !isInRestrictedZone(newX, newY, animal.offsetWidth, animal.offsetHeight)
    ) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > maxDistance) {
        maxDistance = distance;
        bestDirection = { deltaX, deltaY };
      }
    }
  });

  if (!bestDirection) {
    return; 
  }

  const duration = 500; 
  const startX = parseFloat(animal.style.left);
  const startY = parseFloat(animal.style.top);
  const endX = startX + bestDirection.deltaX;
  const endY = startY + bestDirection.deltaY;
  const startTime = performance.now();

  function animateUnstuck(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    animal.style.left = `${startX + (endX - startX) * progress}px`;
    animal.style.top = `${startY + (endY - startY) * progress}px`;

    if (progress < 1) {
      requestAnimationFrame(animateUnstuck);
    }
  }
  requestAnimationFrame(animateUnstuck);
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

  if (isInRestrictedZone(endX - animal.offsetWidth / 2, endY - animal.offsetHeight / 2, animal.offsetWidth, animal.offsetHeight)) {
    moveOutOfRestrictedZone(animal);
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

    if (isInRestrictedZone(nextX, nextY, animal.offsetWidth, animal.offsetHeight)) {
      moveOutOfRestrictedZone(animal);
      setTimeout(() => roamAnimal(animal), 100);
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
    return; 
  }
  const foodX = event.clientX - 10;
  const foodY = event.clientY - 10;
  const foodWidth = 20;
  const foodHeight = 20;

  if (isInRestrictedZone(foodX, foodY, foodWidth, foodHeight)) {
    return;
  }

  foodElement = document.createElement("div");
  foodElement.className = "food";
  foodElement.style.position = "absolute";
  foodElement.style.width = "1.75rem";
  foodElement.style.height = "1.75rem"; 
  foodElement.style.backgroundImage = "url('../assets/Pizza.webp')";
  foodElement.style.backgroundSize = "cover";
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
          foodElement = null; 
          if (
            isInRestrictedZone(
              parseFloat(closestAnimal.style.left),
              parseFloat(closestAnimal.style.top),
              closestAnimal.offsetWidth,
              closestAnimal.offsetHeight
            )
          ) {
            unstickAnimal(closestAnimal);
          }
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
  setTimeout(() => {
    if (
      isInRestrictedZone(
        parseFloat(animal.style.left),
        parseFloat(animal.style.top),
        animal.offsetWidth,
        animal.offsetHeight
      )
    ) {
      unstickAnimal(animal); // Move to nearest open space
    }
  }, 500); // Delay to allow food consumption animation
}
function drawRestrictedZones() {
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
  const scaleX = barnRect.width / 1920; 
  const scaleY = barnRect.height / 1080; 

  const restrictedAreaElements = document.querySelectorAll(".restricted-area");
  restrictedAreaElements.forEach((element, index) => {
    const zone = restrictedZones[index];
    element.style.left = `${zone.x * scaleX}px`;
    element.style.top = `${zone.y * scaleY}px`;
    element.style.width = `${zone.width * scaleX}px`;
    element.style.height = `${zone.height * scaleY}px`;
  });
}
function unstickAnimal(animal) {
  const startX = parseFloat(animal.style.left) + animal.offsetWidth / 2;
  const startY = parseFloat(animal.style.top) + animal.offsetHeight / 2;

  // Parameters for "safe zone" calculation
  const safeDistance = 30; // Minimum safe distance from restricted zones
  const searchRadius = 100; // Maximum distance to look for safe spots
  const stepSize = gridSize; // Incremental step size for nearby positions

  let safeLocations = [];

  // Check grid cells within the search radius
  for (
    let row = -Math.ceil(searchRadius / stepSize);
    row <= Math.ceil(searchRadius / stepSize);
    row++
  ) {
    for (
      let col = -Math.ceil(searchRadius / stepSize);
      col <= Math.ceil(searchRadius / stepSize);
      col++
    ) {
      const candidateX = startX + col * stepSize;
      const candidateY = startY + row * stepSize;

      // Skip if outside container bounds
      if (
        candidateX < 0 ||
        candidateX > animalContainer.clientWidth ||
        candidateY < 0 ||
        candidateY > animalContainer.clientHeight
      )
        continue;

      // Check if candidate position is valid
      if (
        !isInRestrictedZone(
          candidateX - animal.offsetWidth / 2,
          candidateY - animal.offsetHeight / 2,
          animal.offsetWidth,
          animal.offsetHeight
        )
      ) {
        const isFarEnough = restrictedZones.every((zone) => {
          const zoneX = zone.x * scaleX;
          const zoneY = zone.y * scaleY;
          const zoneWidth = zone.width * scaleX;
          const zoneHeight = zone.height * scaleY;
          const zoneCenterX = zoneX + zoneWidth / 2;
          const zoneCenterY = zoneY + zoneHeight / 2;

          const distance = Math.sqrt(
            (candidateX - zoneCenterX) ** 2 + (candidateY - zoneCenterY) ** 2
          );

          return distance >= safeDistance; // Ensure it's at least `safeDistance` away
        });

        if (isFarEnough) {
          safeLocations.push({ x: candidateX, y: candidateY });
        }
      }
    }
  }

  // Pick the closest valid position to the original location
  let closestLocation = null;
  let minDistance = Infinity;
  safeLocations.forEach((location) => {
    const distance = Math.sqrt(
      (location.x - startX) ** 2 + (location.y - startY) ** 2
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  });

  // Smoothly move the animal to the closest safe location
  if (closestLocation) {
    const endX = closestLocation.x - animal.offsetWidth / 2;
    const endY = closestLocation.y - animal.offsetHeight / 2;

    const duration = 500; // Movement duration in milliseconds
    const startTime = performance.now();

    function animateMove(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Clamp progress between 0 and 1

      // Interpolate position
      const newX = startX + (endX - startX) * progress;
      const newY = startY + (endY - startY) * progress;

      animal.style.left = `${newX}px`;
      animal.style.top = `${newY}px`;

      if (progress < 1) {
        requestAnimationFrame(animateMove); // Continue animation
      } else {
        console.log("Animal successfully moved to a safe location.");
      }
    }

    requestAnimationFrame(animateMove); // Start animation
  } else {
    console.warn("No valid nearby location found to unstick the animal.");
  }
}

function updateAnimalSizes() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  const scaleX = barnRect.width / 1920; 
  const scaleY = barnRect.height / 1080;

  const animals = document.querySelectorAll(".animal");
  animals.forEach((animal) => {
    const originalWidth = 50; 
    const originalHeight = 50; 
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
  const scaleX = barnRect.width / 1920; 
  const scaleY = barnRect.height / 1080; 

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
});
updateScalingFactors();
resetGrid();
drawRestrictedZones();

document.addEventListener("DOMContentLoaded", () => {
  const userAnimals = getUserAnimals();
  userAnimals.forEach((animal) => {
    const animalElement = createAnimal(animal);
  });
  animalContainer.addEventListener("dblclick", createFood);
  animalContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("animal")) {
      const animal = event.target;
      showStatWindow(animal);
    } else {
      hideStatWindow();
    }
  });
});

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

let currentAnimal = null;

function showStatWindow(animal) {
  const statWindow = document.getElementById("statWindow");
  const animalName = document.getElementById("animalName");
  const animalAttack = document.getElementById("animalAttack");
  const animalHealth = document.getElementById("animalHealth");
  const animalCost = document.getElementById("animalCost");
  const hrElement = statWindow.querySelector("hr");

  if (currentAnimal === animal) {
    return;
  }

  currentAnimal = animal;

  const animalColor = animal.dataset.color || "#ffffff"; 
  statWindow.style.setProperty('--animal-color', animalColor); 

  if (statWindow.classList.contains("show")) {
    statWindow.classList.remove("show");
    setTimeout(() => {
      animalName.textContent = animal.dataset.name;
      animalAttack.textContent = animal.dataset.attack;
      animalHealth.textContent = animal.dataset.health;
      animalCost.textContent = animal.dataset.cost;
      hrElement.style.width = "0"; 
      statWindow.classList.add("show");
      setTimeout(() => {
        hrElement.style.width = "100%";
      }, 10); 
    }, 300); 
  } else {
    animalName.textContent = animal.dataset.name;
    animalAttack.textContent = animal.dataset.attack;
    animalHealth.textContent = animal.dataset.health;
    animalCost.textContent = animal.dataset.cost;
    hrElement.style.width = "0";
    statWindow.style.display = "block"; 
    setTimeout(() => {
      statWindow.classList.add("show");
      setTimeout(() => {
        hrElement.style.width = "100%"; 
      }, 10); 
    }, 10); 
  }
}

function hideStatWindow() {
  const statWindow = document.getElementById("statWindow");
  statWindow.classList.remove("show");
  setTimeout(() => {
    statWindow.style.display = "none"; 
    currentAnimal = null; 
  }, 300); 
}
  const backgroundAudio = new Audio(
    "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
  );
  backgroundAudio.volume = 0.08;
  backgroundAudio.loop = true;

  const playBackgroundAudio = () => {
    backgroundAudio.play();
    document.removeEventListener("click", playBackgroundAudio);
    document.removeEventListener("keydown", playBackgroundAudio);
    document.removeEventListener("mousemove", playBackgroundAudio);
    document.removeEventListener("scroll", playBackgroundAudio);
    document.removeEventListener("touchstart", playBackgroundAudio);
    document.removeEventListener("focus", playBackgroundAudio);
    document.removeEventListener("mousedown", playBackgroundAudio);
    document.removeEventListener("mouseup", playBackgroundAudio);
  };

  document.addEventListener("click", playBackgroundAudio);
  document.addEventListener("keydown", playBackgroundAudio);
  document.addEventListener("mousemove", playBackgroundAudio);
  document.addEventListener("scroll", playBackgroundAudio);
  document.addEventListener("touchstart", playBackgroundAudio);
  document.addEventListener("focus", playBackgroundAudio);
  document.addEventListener("mousedown", playBackgroundAudio);
  document.addEventListener("mouseup", playBackgroundAudio);