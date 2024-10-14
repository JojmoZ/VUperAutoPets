const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");
let battleLineup = [null, null, null, null, null]; // 5 slots for player
let enemyLineup = [null, null, null, null, null]; // 5 slots for enemy
let randomAnimals = [];
let coins = parseInt(localStorage.getItem("gamecoins")) || 10;

const maxShopAnimals = 3;
const maxSlots = 5;

let shopAnimals = [
  { name: "Ant", attack: 2, health: 1, cost: 2, img: "../assets/Ant.webp" },
  { name: "Fish", attack: 2, health: 3, cost: 5, img: "../assets/Fish.webp" },
  { name: "Lion", attack: 3, health: 4, cost: 7, img: "../assets/Lion.webp" },
  { name: "Pig", attack: 3, health: 1, cost: 3, img: "../assets/Pig.webp" },
  {
    name: "Turtle",
    attack: 1,
    health: 2,
    cost: 4,
    img: "../assets/Turtle.webp",
  },
  {
    name: "Elephant",
    attack: 8,
    health: 7,
    cost: 5,
    img: "../assets/Elephant.webp",
  },
];
function rollShopAnimals() {
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
  const shuffledAnimals = ownedAnimals.sort(() => Math.random() - 0.5);
  randomAnimals =
    shuffledAnimals.length > 0
      ? shuffledAnimals.slice(0, maxShopAnimals)
      : shopAnimals.slice(0, maxShopAnimals);
  renderRandomAnimals();
}
function renderRandomAnimals() {
  const randomAnimalsContainer = document.getElementById("random-animals");
  randomAnimalsContainer.innerHTML = ""; 
  randomAnimals.forEach((animal, index) => {
    const animalDiv = document.createElement("div");
    animalDiv.classList.add("animal");
    animalDiv.setAttribute("draggable", true);
    animalDiv.setAttribute("data-index", index);
    animalDiv.innerHTML = `<img src="${animal.img}" alt="${animal.name}">
                           <p>A:${animal.attack} / H:${animal.health}</p>`;
    randomAnimalsContainer.appendChild(animalDiv);
    animalDiv.addEventListener("dragstart", dragStart);
  });
}
function dragStart(event) {
  const index = event.target.getAttribute("data-index");
  event.dataTransfer.setData("text/plain", index);
}
function handleDrop(event) {
  event.preventDefault();
  const slotIndex = event.target.getAttribute("data-slot");
  const animalIndex = event.dataTransfer.getData("text/plain");
  const selectedAnimal = randomAnimals[animalIndex];

  if (!battleLineup[slotIndex]) {
    battleLineup[slotIndex] = selectedAnimal;
    event.target.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}">`;
    renderTeams();
  }
}
function handleDragOver(event) {
  event.preventDefault();
}
function renderTeams() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  battleLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => ctx.drawImage(img, index * 100 + 20, 20, 60, 60);
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        index * 100 + 20,
        100
      );
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () =>
        ctx.drawImage(img, canvas.width - (index * 100 + 80), 20, 60, 60);
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        canvas.width - (index * 100 + 80),
        100
      );
    }
  });
}
document.querySelectorAll(".battle-slot").forEach((slot) => {
  slot.addEventListener("drop", handleDrop);
  slot.addEventListener("dragover", handleDragOver);
});
document.getElementById("refreshButton").addEventListener("click", function () {
  rollShopAnimals();
});
document
  .getElementById("startBattleButton")
  .addEventListener("click", function () {
    generateEnemyTeam();
    renderTeams();
    simulateBattle();
  });
document.addEventListener("DOMContentLoaded", function () {
  rollShopAnimals();
  renderTeams(); 
});
function generateEnemyTeam() {
  const totalTeamCost = calculateTeamCost(battleLineup);
  enemyLineup = [];

  while (enemyLineup.length < maxSlots && totalTeamCost > 0) {
    const randomAnimal =
      shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
    if (totalTeamCost >= randomAnimal.cost) {
      enemyLineup.push(randomAnimal);
    }
  }
}
function calculateTeamCost(team) {
  return team.reduce(
    (total, animal) => (animal ? total + animal.cost : total),
    0
  );
}