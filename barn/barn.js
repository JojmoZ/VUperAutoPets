const animalContainer = document.getElementById("animals");
const walkingSpeed = 50; 
const frameDuration = 1000 / 60; 
let animationId; 
function getUserAnimals() {
  const storedAnimals = localStorage.getItem("ownedAnimals");
  return storedAnimals ? JSON.parse(storedAnimals) : [];
}
function createAnimal(animal) {
  const animalElement = document.createElement("img");
  animalElement.src = `../assets/${animal.name}.webp`;
  animalElement.className = "animal";
  animalElement.style.position = "absolute"; 
  animalElement.style.left = `${Math.random() * (window.innerWidth - 50)}px`; 
  animalElement.style.top = `${Math.random() * (window.innerHeight - 60)}px`; 
  animalElement.dataset.isMovingToFood = "false"; 
  animalContainer.appendChild(animalElement);
  return animalElement;
}
function createFood(event) {
  const foodElement = document.createElement("div");
  foodElement.className = "food";
  foodElement.style.position = "absolute";
  foodElement.style.width = "20px";  
  foodElement.style.height = "20px";  
  foodElement.style.backgroundColor = "yellow"; 
  foodElement.style.borderRadius = "50%";  
  foodElement.style.left = `${event.clientX - 10}px`;  
  foodElement.style.top = `${event.clientY - 60}px`;  
  animalContainer.appendChild(foodElement);
}

function moveToFood(animalElement, foodElement) {
  if (animalElement.dataset.isMovingToFood === "true") return;
  animalElement.dataset.isMovingToFood = "true"; 

  function move() {
    searchForFood(animalElement); 
    if (!document.body.contains(foodElement)) {
      animalElement.dataset.isMovingToFood = "false"; 
      moveAnimal(animalElement); 
      return;
    }
    const animalX = parseFloat(animalElement.style.left);
    const animalY = parseFloat(animalElement.style.top);
    const foodX = parseFloat(foodElement.style.left);
    const foodY = parseFloat(foodElement.style.top);
    const deltaX = foodX - animalX;
    const deltaY = foodY - animalY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance < 5) {
      animalElement.style.left = `${foodX}px`;
      animalElement.style.top = `${foodY}px`;
      foodElement.remove(); 
      setTimeout(() => {
        animalElement.dataset.isMovingToFood = "false"; 
        moveAnimal(animalElement);
      }, 1000);
      return;
    }
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
  if (isInRestrictedZone(endX, endY, animalWidth, animalHeight)) {
    console.log(
      "Animal trying to enter restricted zone, changing direction..."
    );
    moveAnimal(animalElement); 
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
drawRestrictedZones();
const userAnimals = getUserAnimals();
userAnimals.forEach((animal) => {
  const animalElement = createAnimal(animal);
  moveAnimal(animalElement); 
});
animalContainer.addEventListener("dblclick", createFood);
setInterval(() => {
  const animals = document.querySelectorAll(".animal");
  animals.forEach((animal) => searchForFood(animal));
}, 50);
