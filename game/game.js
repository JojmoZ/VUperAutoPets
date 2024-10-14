const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");
let enemyLineup = [null, null, null, null, null];
let battleLineup = JSON.parse(localStorage.getItem("battleLineup")) || [
  null,
  null,
  null,
  null,
  null,
];
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
        ctx.drawImage(
          img,
          teamOffsetX + (maxSlots - 1 - index) * 100,20,60,60);
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        teamOffsetX + (maxSlots - 1 - index) * 100,
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
  localStorage.setItem("gamecoins", coins);
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
function simulateBattle() {
  console.clear(); 
  let turnCount = 1;
  const maxTurns = 10;

  function playTurn() {
    if (
      turnCount > maxTurns ||
      !battleLineup.some((animal) => animal) ||
      !enemyLineup.some((animal) => animal)
    ) {
      const playerSurvivors = battleLineup.filter(
        (animal) => animal !== null
      ).length;
      const enemySurvivors = enemyLineup.filter(
        (animal) => animal !== null
      ).length;
      if (playerSurvivors > enemySurvivors) {
        console.log("User wins!");
      } else if (playerSurvivors < enemySurvivors) {
        console.log("Enemy wins!");
      } else {
        console.log("It's a draw!");
      }

      renderTeams();
      return;
    }

    console.log(`Turn ${turnCount}`);

    const playerAnimalIndex = battleLineup.findIndex(
      (animal) => animal !== null
    );
    const playerAnimal = battleLineup[playerAnimalIndex];
    if (playerAnimal) {
      const enemyAnimalIndex = enemyLineup.findIndex(
        (animal) => animal !== null
      );
      const enemyAnimal = enemyLineup[enemyAnimalIndex];
      if (enemyAnimal) {
        console.log(`User's ${playerAnimal.name} attacks`);
        console.log(`Enemy's ${enemyAnimal.name} attacks`);
        enemyAnimal.health -= playerAnimal.attack;
        playerAnimal.health -= enemyAnimal.attack;
        if (enemyAnimal.health <= 0 && playerAnimal.health <= 0) {
          console.log(`Enemy's ${enemyAnimal.name} died`);
          console.log(`User's ${playerAnimal.name} died`);
          enemyLineup[enemyAnimalIndex] = null;
          battleLineup[playerAnimalIndex] = null;
          renderTeams();
        } else {
          if (enemyAnimal.health <= 0) {
            console.log(`Enemy's ${enemyAnimal.name} died`);
            enemyLineup[enemyAnimalIndex] = null;
            renderTeams();
          }
          if (playerAnimal.health <= 0) {
            console.log(`User's ${playerAnimal.name} died`);
            battleLineup[playerAnimalIndex] = null;
            renderTeams();
          }
        }
      }
    }
    if (!battleLineup.some((animal) => animal)) {
      if (!enemyLineup.some((animal) => animal)) {
        console.log("It's a draw!");
      } else {
        console.log("You lose!");
      }
      return;
    }
    if (!enemyLineup.some((animal) => animal)) {
      console.log("You win!");
      return;
    }
    turnCount++;
    setTimeout(playTurn, 1000);
  }
  playTurn();
}
