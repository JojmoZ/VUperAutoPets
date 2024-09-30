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
  const animalElement = document.createElement("img");
  animalElement.src = `../assets/${animal}.webp`;
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
        animalElement.dataset.isMovingToFood = "false"; // Mark as not moving to food
        moveAnimal(animalElement); // Return to walking state after eating
      }, 1000); // Short delay before resuming walking
      return;
    }

    // Calculate normalized step values based on speed
    const stepX = (deltaX / distance) * (walkingSpeed * (frameDuration / 1000));
    const stepY = (deltaY / distance) * (walkingSpeed * (frameDuration / 1000));

    // Update position incrementally
    animalElement.style.left = `${animalX + stepX}px`;
    animalElement.style.top = `${animalY + stepY}px`;

    // Continue moving towards the food
    requestAnimationFrame(move); // Continue moving
  }

  move(); // Start moving towards the food
}

// Function to search for food and move the animal towards it
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
function moveAnimal(animalElement) {
  if (animalElement.dataset.isMovingToFood === "true") return; // Prevent movement if heading to food

  const walkDuration = Math.random() * (7000 - 3000) + 3000; // Random walk duration between 3s and 7s
  const idleDuration = Math.random() * (3000 - 2000) + 2000; // Random idle duration between 2s and 3s
  const direction = Math.random() * 2 * Math.PI; // Random direction in radians
  const distance = 50; // Move distance

  const deltaX = Math.cos(direction) * distance; // Calculate deltaX based on direction
  const deltaY = Math.sin(direction) * distance; // Calculate deltaY based on direction

  // Current position
  const startX = parseFloat(animalElement.style.left);
  const startY = parseFloat(animalElement.style.top);

  // New positions with boundaries
  const endX = Math.min(
    Math.max(startX + deltaX, 0),
    animalContainer.clientWidth - 50
  );
  const endY = Math.min(
    Math.max(startY + deltaY, 0),
    animalContainer.clientHeight - 60
  );

  // Animate movement smoothly using requestAnimationFrame
  const duration = walkDuration / 1000; // Convert to seconds
  const startTime = performance.now(); // Record start time

  function animateMovement(currentTime) {
    const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
    const progress = Math.min(elapsedTime / duration, 1); // Progress of the animation

    // Update position based on easing
    animalElement.style.left = `${startX + (endX - startX) * progress}px`;
    animalElement.style.top = `${startY + (endY - startY) * progress}px`;

    // Continue animating until the duration is completed
    if (progress < 1) {
      animationId = requestAnimationFrame(animateMovement);
    } else {
      // Set a timeout to idle after walking
      setTimeout(() => {
        animalElement.style.transition = "none"; // Disable transition for idle
        setTimeout(() => {
          moveAnimal(animalElement); // Continue walking after idling
        }, idleDuration); // Wait for idle duration
      }, 0); // Allow some time before starting idle
    }
  }

  requestAnimationFrame(animateMovement); // Start the animation
}

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
