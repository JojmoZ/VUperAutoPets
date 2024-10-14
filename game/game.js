const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");
let enemyLineup = [null, null, null, null, null];
let battleLineup = JSON.parse(localStorage.getItem("battleLineup")) || [null,null,null,null,null,];
let randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
let coins = parseInt(localStorage.getItem("gamecoins")) || 0;
document.getElementById("coins").textContent = `Coins: ${coins}`;
const maxShopAnimals = 3;
const maxSlots = 5;
let shopAnimals = [
  { name: "Ant", attack: 2, health: 1, cost: 2, img: "../assets/Ant.webp" },
  { name: "Fish", attack: 2, health: 3, cost: 5, img: "../assets/Fish.webp" },
  { name: "Lion", attack: 3, health: 4, cost: 7, img: "../assets/Lion.webp" },
  { name: "Pig", attack: 3, health: 1, cost: 3, img: "../assets/Pig.webp" },
  { name: "Turtle", attack: 1, health: 2,cost: 4,img: "../assets/Turtle.webp",},
  { name: "Elephant",attack: 8,health: 7,cost: 5,img: "../assets/Elephant.webp",},
];
function saveRandomAnimals() {
  localStorage.setItem("randomAnimals", JSON.stringify(randomAnimals));
}
function rollShopAnimals() {
  if (coins >= 1) {
    coins -= 1;
    updateCoinsDisplay();

    const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
    const shuffledAnimals = ownedAnimals
      ? ownedAnimals.sort(() => Math.random() - 0.5)
      : shopAnimals.sort(() => Math.random() - 0.5);
    randomAnimals = shuffledAnimals.slice(0, maxShopAnimals);

    renderRandomAnimals();
    saveRandomAnimals(); 
  } else {
    alert("Not enough coins to refresh!");
  }
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
function saveBattleLineup() {
  localStorage.setItem("battleLineup", JSON.stringify(battleLineup));
}
function handleDrop(event) {
  event.preventDefault();
  const slotIndex = event.target.getAttribute("data-slot");
  const animalIndex = event.dataTransfer.getData("text/plain");
  const selectedAnimal = randomAnimals[animalIndex];

  if (!battleLineup[slotIndex] && coins >= selectedAnimal.cost) {
    battleLineup[slotIndex] = selectedAnimal;
    event.target.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}">`;
    coins -= selectedAnimal.cost;
    updateCoinsDisplay();

    renderTeams();
    saveBattleLineup(); 
  } else {
    alert("Not enough coins or slot is already filled!");
  }
}
function handleDragOver(event) {
  event.preventDefault();
}
function renderTeams() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const teamOffsetX = 100; 
  const enemyOffsetX = canvas.width - 550; 
  battleLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () =>
        ctx.drawImage(img, teamOffsetX + index * 100, 20, 60, 60); 
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        teamOffsetX + index * 100,
        100
      );
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () =>
        ctx.drawImage(img, enemyOffsetX + index * 100, 20, 60, 60); 
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        enemyOffsetX + index * 100,
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
  if (localStorage.getItem("randomAnimals")) {
    randomAnimals = JSON.parse(localStorage.getItem("randomAnimals"));
    renderRandomAnimals();
  } else {
    rollShopAnimals();
  }

  if (localStorage.getItem("battleLineup")) {
    battleLineup = JSON.parse(localStorage.getItem("battleLineup"));
    renderTeams();
  }

  updateCoinsDisplay();
});
function updateCoinsDisplay() {
  localStorage.setItem("gamecoins", coins); // Save to localStorage
  document.getElementById("coins").textContent = `Coins: ${coins}`;
}
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
document.getElementById("coins").textContent = `Coins: ${coins}`;