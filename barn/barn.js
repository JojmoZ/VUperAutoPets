const animalContainer = document.getElementById("animals");
const walkingSpeed = 100;
const path = window.electron.path;
const appDir = window.electron.__dirname;
const frameDuration = 1000 / 60;
localStorage.removeItem("ingame");
const gridSize = 10;
let animationId;
let grid;
let foodElement = null;
let foodElements = [];
let scaleX, scaleY;
const restrictedZones = [
  { x: 0, y: 0, width: 60, height: 1080 },
  { x: 0, y: 130, width: 320, height: 140 },
  { x: 0, y: 0, width: 160, height: 80 },
  { x: 280, y: 50, width: 30, height: 100 },
  { x: 0, y: 1070, width: 1920, height: 150 },
  { x: 0, y: 430, width: 445, height: 35 },
  { x: 0, y: 840, width: 280, height: 90 },
  { x: 270, y: 820, width: 330, height: 100 },
  { x: 295, y: 800, width: 150, height: 80 },
  { x: 270, y: 850, width: 10, height: 80 },
  { x: 410, y: 50, width: 20, height: 200 },
  { x: 430, y: 130, width: 30, height: 50 },
  { x: 435, y: 430, width: 15, height: 165 },
  { x: 435, y: 635, width: 15, height: 180 },
  { x: 390, y: 160, width: 120, height: 100 },
  { x: 420, y: 180, width: 120, height: 100 },
  { x: 440, y: 200, width: 120, height: 100 },
  { x: 460, y: 220, width: 120, height: 100 },
  { x: 500, y: 210, width: 330, height: 140 },
  { x: 600, y: 790, width: 20, height: 140 },
  { x: 605, y: 0, width: 155, height: 130 },
  { x: 670, y: 790, width: 20, height: 140 },
  { x: 690, y: 805, width: 90, height: 120 },
  { x: 780, y: 805, width: 100, height: 100 },
  { x: 795, y: 120, width: 20, height: 90 },
  { x: 800, y: 785, width: 200, height: 60 },
  { x: 820, y: 905, width: 15, height: 180 },
  { x: 890, y: 760, width: 180, height: 70 },
  { x: 890, y: 240, width: 100, height: 100 },
  { x: 915 - 5, y: 120, width: 25, height: 130 },
  { x: 915 - 5, y: 200, width: 50, height: 60 },
  { x: 929, y: 260, width: 120, height: 100 },
  { x: 949, y: 280, width: 120, height: 100 },
  { x: 969, y: 140 + 160, width: 120, height: 100 },
  { x: 970, y: 740, width: 100, height: 70 },
  { x: 990, y: 720, width: 100, height: 70 },
  { x: 1010, y: 700, width: 100, height: 70 },
  { x: 1040, y: 670, width: 100, height: 60 },
  { x: 1040, y: 430, width: 170, height: 75 },
  { x: 1060, y: 410, width: 130, height: 130 },
  { x: 1065, y: 590, width: 100, height: 120 },
  { x: 1065, y: 445, width: 100, height: 120 },
  { x: 1085, y: 210, width: 80, height: 300 },
  { x: 1110, y: 190, width: 80, height: 100 },
  { x: 1130, y: 170, width: 80, height: 70 },
  { x: 1150, y: 170, width: 80, height: 20 },
  { x: 1160, y: 140, width: 100, height: 30 },
  { x: 1170, y: 0, width: 120, height: 20 },
  { x: 1160, y: 20, width: 120, height: 40 },
  { x: 1160, y: 90, width: 100, height: 80 },
  { x: 1169, y: 140 + 150, width: 260, height: 100 },
  { x: 1169 + 225, y: 180, width: 16, height: 100 },
  { x: 1350, y: 885, width: 1920 - 1350, height: 190 },
  { x: 1410, y: 0, width: 220, height: 150 },
  { x: 1169, y: 140 + 120, width: 245, height: 50 },
  { x: 1610, y: 150 + 140, width: 1920 - 1610, height: 100 },
  { x: 1630, y: 100, width: 25, height: 50 },
  { x: 1635, y: 180, width: 14, height: 140 },
  { x: 1635, y: 140 + 120, width: 1920 - 1635, height: 50 },
  { x: 1680, y: 30, width: 90, height: 65 },
  { x: 1850, y: 0, width: 70, height: 1080 },
];

const logged = localStorage.getItem("loggedin");

if (!logged) {
  function clearLocalStorageExceptUsers() {
    const keysToKeep = ["users"];

    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  clearLocalStorageExceptUsers();

  const loginPath = path.join(appDir, "login/index.html");
  window.location.href = `file://${loginPath}`;
}

function isInRestrictedZone(animalX, animalY, animalWidth, animalHeight) {
  const { bgWidth, bgHeight, offsetX, offsetY } = calculateBackgroundOffsets();

  return restrictedZones.some((zone) => {
    const zoneX = (zone.x / 1920) * bgWidth + offsetX;
    const zoneY = (zone.y / 1080) * bgHeight + offsetY;
    const zoneWidth = (zone.width / 1920) * bgWidth;
    const zoneHeight = (zone.height / 1080) * bgHeight;

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
const grida = Array.from({ length: rows }, () => Array(cols).fill(0));
restrictedZones.forEach((zone) => {
  const startX = Math.floor(zone.x / gridSize);
  const startY = Math.floor(zone.y / gridSize);
  const endX = Math.floor((zone.x + zone.width) / gridSize);
  const endY = Math.floor((zone.y + zone.height) / gridSize);
  for (let i = startY; i <= endY; i++) {
    if (i >= rows) continue;
    for (let j = startX; j <= endX; j++) {
      if (j >= cols) continue;
      grida[i][j] = 1;
    }
  }
});

function getUserAnimals() {
  const storedAnimals = localStorage.getItem("ownedAnimals");
  return storedAnimals ? JSON.parse(storedAnimals) : [];
}

function createAnimal(animal) {
  const animalElement = document.createElement("img");
  animalElement.src = animal.img;
  animalElement.className = "animal";
  animalElement.style.position = "absolute";
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
const backbtn = document.getElementById("backArrow");
backbtn.addEventListener("click", function () {
  const menuPath = path.join(appDir, "menu/menu.html");
  window.location.href = `file://${menuPath}`;
});
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

  if (
    isInRestrictedZone(
      endX - animal.offsetWidth / 2,
      endY - animal.offsetHeight / 2,
      animal.offsetWidth,
      animal.offsetHeight
    )
  ) {
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

    if (
      isInRestrictedZone(nextX, nextY, animal.offsetWidth, animal.offsetHeight)
    ) {
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
  const { bgWidth, bgHeight, offsetX, offsetY } = calculateBackgroundOffsets();

  // Calculate food coordinates relative to the scaled background
  const foodX = (event.clientX - offsetX) / (bgWidth / 1920);
  const foodY = (event.clientY - offsetY) / (bgHeight / 1080);
  const foodWidth = 20;
  const foodHeight = 20;

  // Check if the food is placed in a restricted zone
  if (isInRestrictedZone(foodX, foodY, foodWidth, foodHeight)) {
    console.warn("Food placement is in a restricted zone.");
    return;
  }

  // Create and style the food element
  const foodElement = document.createElement("div");
  foodElement.className = "food";
  foodElement.style.position = "absolute";
  foodElement.style.width = "1.75rem";
  foodElement.style.height = "1.75rem";
  foodElement.style.backgroundImage = "url('../assets/items/Pizza.webp')";
  foodElement.style.backgroundSize = "cover";

  // Position the food element relative to the scaled background
  foodElement.style.left = `${(foodX / 1920) * bgWidth + offsetX}px`;
  foodElement.style.top = `${(foodY / 1080) * bgHeight + offsetY}px`;
  animalContainer.appendChild(foodElement);
  foodElements.push(foodElement);

  // Convert food position to grid indices
  const foodRow = Math.floor(foodY / gridSize);
  const foodCol = Math.floor(foodX / gridSize);

  // Find the closest animal to the food
  const animals = document.querySelectorAll(".animal");
  let closestAnimal = null;
  let minDistance = Infinity;

  animals.forEach((animal) => {
    if (animal.dataset.isMovingToFood === "true") return;

    // Get animal's position relative to the scaled background
    const animalX =
      (parseFloat(animal.style.left) - offsetX) / (bgWidth / 1920);
    const animalY =
      (parseFloat(animal.style.top) - offsetY) / (bgHeight / 1080);

    const animalRow = Math.floor(animalY / gridSize);
    const animalCol = Math.floor(animalX / gridSize);

    // Calculate Manhattan distance between the animal and the food
    const distance =
      Math.abs(animalRow - foodRow) + Math.abs(animalCol - foodCol);

    if (distance < minDistance) {
      minDistance = distance;
      closestAnimal = animal;
    }
  });

  if (closestAnimal) {
    console.log(closestAnimal);
    closestAnimal.dataset.isMovingToFood = "true";
    cancelAnimationFrame(closestAnimal.roamAnimationId);
    setTimeout(() => {
      // Calculate starting and ending points for pathfinding
      const start = {
        row: Math.floor(
          (parseFloat(closestAnimal.style.top) - offsetY) /
            (gridSize * (bgHeight / 1080))
        ),
        col: Math.floor(
          (parseFloat(closestAnimal.style.left) - offsetX) /
            (gridSize * (bgWidth / 1920))
        ),
      };

      const end = {
        row: foodRow,
        col: foodCol,
      };

      const path = astar(start, end);
      if (!path) {
        console.warn("Pathfinding failed: No valid path found.");
      } else {
        console.log("Path:", path);
      }
      if (path) {
        followPath(closestAnimal, path, () => {
          foodElement.remove();
          foodElements = foodElements.filter((el) => el !== foodElement);
          closestAnimal.dataset.isMovingToFood = "false";
          roamAnimal(closestAnimal);
        });
      }
    }, 200);
  } else {
    console.warn("No closest animal found for the food.");
  }
}

function followPath(animal, path, callback) {
  let index = 0;
  const speed = 1;

  function moveStep() {
    if (index >= path.length) {
      if (callback) callback();
      return;
    }

    const { bgWidth, bgHeight, offsetX, offsetY } =
      calculateBackgroundOffsets(); // Apply scaling offsets dynamically

    // Target position (scaled and adjusted)
    const node = path[index];
    const nextX =
      (node.col * gridSize * bgWidth) / 1920 +
      offsetX +
      (gridSize * bgWidth) / 1920 / 2;
    const nextY =
      (node.row * gridSize * bgHeight) / 1080 +
      offsetY +
      (gridSize * bgHeight) / 1080 / 2;

    // Current position of the animal
    const currentX = parseFloat(animal.style.left) + animal.offsetWidth / 2;
    const currentY = parseFloat(animal.style.top) + animal.offsetHeight / 2;

    // Calculate movement
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
      // Snap to next grid node
      animal.style.left = `${nextX - animal.offsetWidth / 2}px`;
      animal.style.top = `${nextY - animal.offsetHeight / 2}px`;
      index++;
      setTimeout(moveStep, 10);
    }
  }

  moveStep();
}

function drawRestrictedZones() {
  const { bgWidth, bgHeight, offsetX, offsetY } = calculateBackgroundOffsets();
  const existingZones = document.querySelectorAll(".restricted-area");
  existingZones.forEach((zone) => zone.remove());

  restrictedZones.forEach((zone) => {
    const zoneElement = document.createElement("div");
    zoneElement.className = "restricted-area";

    zoneElement.style.position = "absolute";
    zoneElement.style.left = `${(zone.x / 1920) * bgWidth + offsetX}px`;
    zoneElement.style.top = `${(zone.y / 1080) * bgHeight + offsetY}px`;
    zoneElement.style.width = `${(zone.width / 1920) * bgWidth}px`;
    zoneElement.style.height = `${(zone.height / 1080) * bgHeight}px`;

    animalContainer.appendChild(zoneElement);
  });
}

// drawRestrictedZones();

window.addEventListener("resize", () => {
  drawRestrictedZones();
});
// resetGrid();
// // updateScalingFactors();
// drawRestrictedZones();
let initialGridResetDone = false;
document.addEventListener("DOMContentLoaded", () => {
  hideStatWindow();
  const userAnimals = getUserAnimals();
  setTimeout(() => {
    resetGrid();
    drawRestrictedZones();
  }, 100); // Allow time for initial rendering and resizing
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

function calculateBackgroundOffsets() {
  const barnElement = document.getElementById("animals");
  const barnRect = barnElement.getBoundingClientRect();
  const bgImageAspectRatio = 1920 / 1080;
  const containerAspectRatio = barnRect.width / barnRect.height;

  let bgWidth, bgHeight, offsetX, offsetY;

  if (containerAspectRatio > bgImageAspectRatio) {
    bgWidth = barnRect.width;
    bgHeight = barnRect.width / bgImageAspectRatio;
    offsetX = 0;
    offsetY = (barnRect.height - bgHeight) / 2;
  } else {
    bgWidth = barnRect.height * bgImageAspectRatio;
    bgHeight = barnRect.height;
    offsetX = (barnRect.width - bgWidth) / 2;
    offsetY = 0;
  }

  return { bgWidth, bgHeight, offsetX, offsetY };
}
function initializeGrid() {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function resetGrid() {
  const { bgWidth, bgHeight } = calculateBackgroundOffsets();
  const rows = Math.floor(bgHeight / gridSize);
  const cols = Math.floor(bgWidth / gridSize);

  grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  restrictedZones.forEach((zone) => {
    const startX = Math.floor(zone.x / gridSize);
    const startY = Math.floor(zone.y / gridSize);
    const endX = Math.floor((zone.x + zone.width) / gridSize);
    const endY = Math.floor((zone.y + zone.height) / gridSize);

    for (let i = startY; i <= endY; i++) {
      if (i < 0 || i >= rows) continue;
      for (let j = startX; j <= endX; j++) {
        if (j < 0 || j >= cols) continue;
        grid[i][j] = 1;
      }
    }
  });
}

let currentAnimal = null;

function showStatWindow(animal) {
  const pic = document.getElementById("animalStatPicture");
  pic.src = animal.src;

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
  statWindow.style.setProperty("--animal-color", animalColor);

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

  function updateStatWindowPosition() {
    const animalRect = animal.getBoundingClientRect();
    statWindow.style.left = `${animalRect.right + 10}px`;
    statWindow.style.top = `${animalRect.top}px`;
    requestAnimationFrame(updateStatWindowPosition);
  }

  updateStatWindowPosition();
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
const savedTime = localStorage.getItem("backgroundAudioTime");
if (savedTime) {
  backgroundAudio.currentTime = parseFloat(savedTime);
}

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
