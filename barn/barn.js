const animalContainer = document.getElementById("animals");
const walkingSpeed = 50; // Walking speed in pixels per second
const frameDuration = 1000 / 60; // Duration for each frame (60 FPS)
let animationId; // To store the requestAnimationFrame ID

// Function to retrieve animals from local storage
function getUserAnimals() {
  const storedAnimals = localStorage.getItem("ownedAnimals");
  return storedAnimals ? JSON.parse(storedAnimals) : [];
}

// Function to create an animal element
function createAnimal(animal) {
  // console.log(animal)
  const animalElement = document.createElement("img");
  animalElement.src = `../assets/${animal.name}.webp`;
  animalElement.className = "animal";
  animalElement.style.position = "absolute"; // Ensure absolute positioning for movement
  animalElement.style.left = `${Math.random() * (window.innerWidth - 50)}px`; // Random start position
  animalElement.style.top = `${Math.random() * (window.innerHeight - 60)}px`; // Random start position
  animalElement.dataset.isMovingToFood = "false"; // Track if the animal is currently moving to food
  animalContainer.appendChild(animalElement);
  return animalElement;
}

// Function to create food when double-clicking on the canvas
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

  function move() {
    // Constantly search for the closest food
    searchForFood(animalElement); // This will update foodElement if needed

    // If the foodElement is removed or is no longer valid, return
    if (!document.body.contains(foodElement)) {
      animalElement.dataset.isMovingToFood = "false"; // Mark as not moving to food
      moveAnimal(animalElement); // Return to walking state
      return;
    }

    // Calculate positions and movement
    const animalX = parseFloat(animalElement.style.left);
    const animalY = parseFloat(animalElement.style.top);
    const foodX = parseFloat(foodElement.style.left);
    const foodY = parseFloat(foodElement.style.top);

    const deltaX = foodX - animalX;
    const deltaY = foodY - animalY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Stop moving if close enough to the food
    if (distance < 5) {
      animalElement.style.left = `${foodX}px`;
      animalElement.style.top = `${foodY}px`;
      foodElement.remove(); // Remove the food
      setTimeout(() => {
        animalElement.dataset.isMovingToFood = "false"; 
        moveAnimal(animalElement);
      }, 1000); // Short delay before resuming walking
      return;
    }

    // Calculate normalized step values based on speed
    const stepX = (deltaX / distance) * (walkingSpeed * (frameDuration / 1000));
    const stepY = (deltaY / distance) * (walkingSpeed * (frameDuration / 1000));
    animalElement.style.left = `${animalX + stepX}px`;
    animalElement.style.top = `${animalY + stepY}px`;
    requestAnimationFrame(move); 
  }

  move(); 
}
function searchForFood(animal) {
  const foodElements = document.querySelectorAll(".food");
  let closestFood = null;
  let closestDistance = Infinity;

  // Find the closest food
  foodElements.forEach((food) => {
    const animalX = parseFloat(animal.style.left);
    const animalY = parseFloat(animal.style.top);
    const foodX = parseFloat(food.style.left);
    const foodY = parseFloat(food.style.top);

    // Calculate distance to food
    const distance = Math.sqrt(
      Math.pow(foodX - animalX, 2) + Math.pow(foodY - animalY, 2)
    );

    // Update closest food if this one is closer
    if (distance < closestDistance) {
      closestDistance = distance;
      closestFood = food;
    }
  });

  // If closestFood found and not already moving to it, move to it
  if (closestFood && animal.dataset.isMovingToFood === "false") {
    moveToFood(animal, closestFood);
  }
}

// Function to move an animal randomly
// Define restricted zones as an array of objects with x, y, width, and height
const restrictedZones = [
  { x: 100, y: 100, width: 200, height: 150 }, // Restricted zone 1
  { x: 400, y: 300, width: 100, height: 100 }, // Restricted zone 2
  { x: 600, y: 150, width: 150, height: 200 }, // Restricted zone 3
  { x: 250, y: 450, width: 180, height: 120 }, // Restricted zone 4
  { x: 500, y: 500, width: 100, height: 150 }, // Restricted zone 5
  { x: 700, y: 50, width: 120, height: 180 }, // Restricted zone 6
  { x: 800, y: 400, width: 200, height: 100 }, // Restricted zone 7
  { x: 150, y: 600, width: 140, height: 140 }, // Restricted zone 8
  { x: 900, y: 250, width: 100, height: 100 }, // Restricted zone 9
  { x: 300, y: 750, width: 160, height: 100 }, // Restricted zone 10
];

// Function to check if a position is inside a restricted zone
function isInRestrictedZone(animalX, animalY, animalWidth, animalHeight) {
  return restrictedZones.some((zone) => {
    const zoneX = zone.x;
    const zoneY = zone.y;
    const zoneWidth = zone.width;
    const zoneHeight = zone.height;

    // Check if the animal's bounding box intersects the zone's bounding box
    const isOverlapping =
      animalX < zoneX + zoneWidth && // Right edge of the animal is left of the zone's right edge
      animalX + animalWidth > zoneX && // Left edge of the animal is right of the zone's left edge
      animalY < zoneY + zoneHeight && // Bottom edge of the animal is above the zone's bottom edge
      animalY + animalHeight > zoneY; // Top edge of the animal is below the zone's top edge

    return isOverlapping;
  });
}

// Modify moveAnimal to avoid restricted zones
function moveAnimal(animalElement) {
  if (animalElement.dataset.isMovingToFood === "true") return;

  const walkDuration = Math.random() * (7000 - 3000) + 3000;
  const idleDuration = Math.random() * (3000 - 2000) + 2000;
  const direction = Math.random() * 2 * Math.PI;
  const distance = 50;

  const deltaX = Math.cos(direction) * distance;
  const deltaY = Math.sin(direction) * distance;

  const startX = parseFloat(animalElement.style.left);
  const startY = parseFloat(animalElement.style.top);
  const animalWidth = animalElement.offsetWidth;
  const animalHeight = animalElement.offsetHeight;

  const endX = Math.min(
    Math.max(startX + deltaX, 0),
    animalContainer.clientWidth - animalWidth
  );
  const endY = Math.min(
    Math.max(startY + deltaY, 0),
    animalContainer.clientHeight - animalHeight
  );

  // Check if the next position would cause the animal to enter a restricted zone
  if (isInRestrictedZone(endX, endY, animalWidth, animalHeight)) {
    console.log(
      "Animal trying to enter restricted zone, changing direction..."
    );
    moveAnimal(animalElement); // Recalculate new movement
    return;
  }

  const duration = walkDuration / 1000;
  const startTime = performance.now();

  function animateMovement(currentTime) {
    const elapsedTime = (currentTime - startTime) / 1000;
    const progress = Math.min(elapsedTime / duration, 1);

    animalElement.style.left = `${startX + (endX - startX) * progress}px`;
    animalElement.style.top = `${startY + (endY - startY) * progress}px`;

    if (progress < 1) {
      animationId = requestAnimationFrame(animateMovement);
    } else {
      setTimeout(() => {
        animalElement.style.transition = "none";
        setTimeout(() => {
          moveAnimal(animalElement);
        }, idleDuration);
      }, 0);
    }
  }

  requestAnimationFrame(animateMovement);
}

// Add restricted zones to your canvas visually (optional)
function drawRestrictedZones() {
  restrictedZones.forEach(zone => {
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

// Call the function to render restricted zones visually
drawRestrictedZones();


// Get user animals and create them in the barn
const userAnimals = getUserAnimals();
userAnimals.forEach((animal) => {
  const animalElement = createAnimal(animal);
  moveAnimal(animalElement); // Start moving the animal
});

// Add event listener to canvas for food creation
animalContainer.addEventListener("dblclick", createFood);

// Start searching for food for each animal periodically
setInterval(() => {
  const animals = document.querySelectorAll(".animal");
  animals.forEach((animal) => searchForFood(animal)); // Check for food for each animal every second
}, 50);
