const animalContainer = document.getElementById("animals");
const walkingSpeed = 50; 
const frameDuration = 1000 / 60; 
let animationId; const restrictedAreas = [
  { x: 100, y: 100, width: 200, height: 150 },
  { x: 400, y: 300, width: 150, height: 200 },
  { x: 600, y: 300, width: 150, height: 200 },
];
function drawRestrictedAreas() {
  restrictedAreas.forEach((area) => {
    const restrictedAreaElement = document.createElement("div");
    restrictedAreaElement.className = "restricted-area";
    restrictedAreaElement.style.position = "absolute";
    restrictedAreaElement.style.left = `${area.x}px`;
    restrictedAreaElement.style.top = `${area.y}px`;
    restrictedAreaElement.style.width = `${area.width}px`;
    restrictedAreaElement.style.height = `${area.height}px`;
    restrictedAreaElement.style.backgroundColor = "rgba(255, 0, 0, 0.5)"; 
    animalContainer.appendChild(restrictedAreaElement);
  });
}
drawRestrictedAreas();
function getUserAnimals() {
  const storedAnimals = localStorage.getItem("ownedAnimals");
  return storedAnimals ? JSON.parse(storedAnimals) : [];
}
function isInRestrictedArea(x, y) {
  return restrictedAreas.some((area) => {
    const isInArea =
      x >= area.x &&
      x <= area.x + area.width &&
      y >= area.y &&
      y <= area.y + area.height;

    // Debugging output
    if (isInArea) {
      console.log(
        `Coordinates (${x}, ${y}) are in restricted area: ${JSON.stringify(
          area
        )}`
      );
    }

    return isInArea;
  });
}

function aStar(start, goal) {
  const openSet = [start];
  const cameFrom = new Map();

  const gScore = new Map(); 
  gScore.set(JSON.stringify(start), 0);

  const fScore = new Map(); 
  fScore.set(JSON.stringify(start), heuristic(start, goal));

  while (openSet.length > 0) {
    let current = openSet.reduce((prev, curr) =>
      fScore.get(JSON.stringify(curr)) < fScore.get(JSON.stringify(prev))
        ? curr
        : prev
    );

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    openSet.splice(openSet.indexOf(current), 1);

    const neighbors = getNeighbors(current);
    for (let neighbor of neighbors) {
      if (isInRestrictedArea(neighbor.x, neighbor.y)) continue;

      const tentativeGScore = gScore.get(JSON.stringify(current)) + 1; 
      if (
        !gScore.has(JSON.stringify(neighbor)) ||
        tentativeGScore < gScore.get(JSON.stringify(neighbor))
      ) {
        cameFrom.set(JSON.stringify(neighbor), current);
        gScore.set(JSON.stringify(neighbor), tentativeGScore);
        fScore.set(
          JSON.stringify(neighbor),
          tentativeGScore + heuristic(neighbor, goal)
        );

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return [];
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function getNeighbors(position) {
  const directions = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ];
  return directions
    .map((dir) => ({
      x: position.x + dir.x * 50, 
      y: position.y + dir.y * 50,
    }))
    .filter(
      (neighbor) =>
        neighbor.x >= 0 &&
        neighbor.y >= 0 &&
        neighbor.x <= window.innerWidth &&
        neighbor.y <= window.innerHeight
    );
}
function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (cameFrom.has(JSON.stringify(current))) {
    current = cameFrom.get(JSON.stringify(current));
    totalPath.push(current);
  }
  return totalPath.reverse();
}
function spawnAnimalOutsideRestrictedArea() {
  let animalX, animalY;
  do {
    animalX = Math.random() * (window.innerWidth - 50);
    animalY = Math.random() * (window.innerHeight - 60);
  } while (isInRestrictedArea(animalX, animalY));
  return { x: animalX, y: animalY };
}
function createAnimal(animal) {
  const { x, y } = spawnAnimalOutsideRestrictedArea();
  const animalElement = document.createElement("img");
  animalElement.src = `../assets/${animal}.webp`;
  animalElement.className = "animal";
  animalElement.style.position = "absolute"; // Ensure absolute positioning for movement
  animalElement.style.left = `${x}px`;
  animalElement.style.top = `${y}px`;
  animalElement.dataset.isMovingToFood = "false"; // Track if the animal is currently moving to food
  animalContainer.appendChild(animalElement);
  return animalElement;
}
function createFood(event) {
  const foodElement = document.createElement("div");
  foodElement.className = "food";
  foodElement.style.position = "absolute";
  foodElement.style.width = "20px"; // Width of food
  foodElement.style.height = "20px"; // Height of food
  foodElement.style.backgroundColor = "yellow"; // Food color
  foodElement.style.borderRadius = "50%"; // Make it round
  foodElement.style.left = `${event.clientX - 10}px`; // Center the food
  foodElement.style.top = `${event.clientY - 60}px`; // Center the food
  animalContainer.appendChild(foodElement);
}
function moveToFood(animalElement, foodElement) {
  if (animalElement.dataset.isMovingToFood === "true") return; // Prevent re-entry
  animalElement.dataset.isMovingToFood = "true"; // Mark as moving to food
  const foodPosition = {
    x: parseFloat(foodElement.style.left),
    y: parseFloat(foodElement.style.top),
  };
  const startPosition = {
    x: parseFloat(animalElement.style.left),
    y: parseFloat(animalElement.style.top),
  };
  const path = aStar(startPosition, foodPosition); // Find the path using A*
  if (path.length === 0) {
    animalElement.dataset.isMovingToFood = "false"; // No valid path found
    moveAnimal(animalElement); // Return to walking state
    return;
  }
  function followPath(pathIndex) {
    if (pathIndex >= path.length) {
      animalElement.dataset.isMovingToFood = "false"; // Mark as not moving to food
      moveAnimal(animalElement); // Return to walking state after eating
      return;
    }
    const targetPosition = path[pathIndex];
    animalElement.style.left = `${targetPosition.x}px`;
    animalElement.style.top = `${targetPosition.y}px`;
    requestAnimationFrame(() => followPath(pathIndex + 1));
  }
  followPath(0); // Start following the path
}
function searchForFood(animal) {
  const foodElements = document.querySelectorAll(".food");
  let closestFood = null;
  let closestDistance = Infinity;
  foodElements.forEach((food) => {
    const animalX = parseFloat(animal.style.left);
    const animalY = parseFloat(animal.style.top);
    const foodX = parseFloat(food.style.left);
    const foodY = parseFloat(food.style.top);
    const distance = Math.sqrt(
      Math.pow(foodX - animalX, 2) + Math.pow(foodY - animalY, 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestFood = food;
    }
  });
  if (closestFood && animal.dataset.isMovingToFood === "false") {
    moveToFood(animal, closestFood);
  }
}
function moveAnimal(animalElement) {
  if (animalElement.dataset.isMovingToFood === "true") return; // Prevent movement if heading to food

  const walkDuration = Math.random() * (7000 - 3000) + 3000; // Random walk duration between 3s and 7s
  const idleDuration = Math.random() * (3000 - 2000) + 2000; // Random idle duration between 2s and 3s
  const direction = Math.random() * 2 * Math.PI; // Random direction in radians
  const distance = 50; // Move distance

  const deltaX = Math.cos(direction) * distance; // Calculate deltaX based on direction
  const deltaY = Math.sin(direction) * distance; // Calculate deltaY based on direction
  const startX = parseFloat(animalElement.style.left);
  const startY = parseFloat(animalElement.style.top);
  const endX = Math.min(
    Math.max(startX + deltaX, 0),
    animalContainer.clientWidth - 50
  );
  const endY = Math.min(
    Math.max(startY + deltaY, 0),
    animalContainer.clientHeight - 60
  );

  // Check if the end position is in a restricted area
  if (isInRestrictedArea(endX, endY)) {
    // If the end position is restricted, try moving again
    moveAnimal(animalElement); // Try moving again
    return; // Exit the function to avoid further movement
  }

  // Ensure the entire path does not intersect with restricted areas
  if (isPathInRestrictedArea(startX, startY, endX, endY)) {
    moveAnimal(animalElement); // Try moving again if path is restricted
    return; // Exit the function to avoid further movement
  }

  const duration = walkDuration / 1000; // Convert to seconds
  const startTime = performance.now(); // Record start time

  function animateMovement(currentTime) {
    const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
    const progress = Math.min(elapsedTime / duration, 1); // Progress of the animation
    animalElement.style.left = `${startX + (endX - startX) * progress}px`;
    animalElement.style.top = `${startY + (endY - startY) * progress}px`;

    if (progress < 1) {
      animationId = requestAnimationFrame(animateMovement);
    } else {
      setTimeout(() => {
        animalElement.style.transition = "none"; // Disable transition for idle
        setTimeout(() => {
          moveAnimal(animalElement); // Continue walking after idling
        }, idleDuration); // Wait for idle duration
      }, 0); // Allow some time before starting idle
    }
  }
  requestAnimationFrame(animateMovement);
}


function isPathInRestrictedArea(startX, startY, endX, endY) {
  const steps = 10; // Number of steps to check along the path
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // Progress along the path
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;

    if (isInRestrictedArea(x, y)) {
      return true; // Path intersects with a restricted area
    }
  }
  return false; // Path does not intersect with any restricted area
}
const userAnimals = getUserAnimals();
userAnimals.forEach((animal) => {
  const animalElement = createAnimal(animal);
  moveAnimal(animalElement); // Start moving the animal
});
animalContainer.addEventListener("dblclick", createFood);
setInterval(() => {
  const animals = document.querySelectorAll(".animal");
  animals.forEach((animal) => searchForFood(animal)); 
}, 50);
