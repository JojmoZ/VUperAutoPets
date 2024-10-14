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

  // Reverse the slot index to place animals in the correct slot in the lineup
  const reversedSlotIndex = maxSlots - 1 - slotIndex;

  const animalIndex = event.dataTransfer.getData("text/plain");
  const selectedAnimal = randomAnimals[animalIndex];

  if (!battleLineup[reversedSlotIndex] && coins >= selectedAnimal.cost) {
    battleLineup[reversedSlotIndex] = selectedAnimal;
    // Render the animal on top of the stone tablet
    event.target.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}" style="position: absolute; width: 80px; height: 80px; top: 10px; left: 10px;">`;
    coins -= selectedAnimal.cost;
    updateCoinsDisplay();
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
  const teamOffsetX = 100; // Positioning of player's team
  const enemyOffsetX = canvas.width - 550; // Positioning of enemy's team

  // Render player's team (right to left)
  battleLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () =>
        ctx.drawImage(
          img,
          teamOffsetX + (maxSlots - 1 - index) * 100, // Flip to render from right to left
          20,
          60,
          60
        );
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        teamOffsetX + (maxSlots - 1 - index) * 100,
        100
      );
    }
  });

  // Render enemy's team (left to right)
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

function renderBattleSlots() {
  const battleSlots = document.querySelectorAll(".battle-slot");
  battleSlots.forEach((slot, index) => {
    const animal = battleLineup[maxSlots -1 -index];
    if (animal) {
      slot.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="width: 80px; height: 80px;">`;
    } else {
      slot.innerHTML = ""; // Clear if no animal is in this slot
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
    hideNonBattleElements(); // Hide other elements
    showCanvas(); // Show the canvas for the battle
    simulateBattle();
  });

// Function to hide elements when the battle starts
function hideNonBattleElements() {
  document.getElementById("battleSlotsContainer").classList.add("hidden"); // Hide slots
  document.getElementById("controls").classList.add("hidden"); // Hide refresh and start buttons
  document.getElementById("backArrow").classList.add("hidden"); // Hide back button
}

// Function to show the canvas
function showCanvas() {
  document.getElementById("battleCanvas").classList.remove("hidden"); // Show canvas
}

// Function to hide the canvas
function hideCanvas() {
  document.getElementById("battleCanvas").classList.add("hidden"); // Hide canvas
}

// Function to show elements when the battle finishes
function showNonBattleElements() {
  document.getElementById("battleSlotsContainer").classList.remove("hidden"); // Show slots
  document.getElementById("controls").classList.remove("hidden"); // Show refresh and start buttons
  document.getElementById("backArrow").classList.remove("hidden"); // Show back button
  hideCanvas(); // Hide the canvas after the battle
}

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
    renderBattleSlots(); // Auto-fill the battle slots with user's animals
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

  // Add a pause before the first attack for proper rendering
  function pauseBeforeFirstTurn() {
    renderTeams();
    setTimeout(playTurn, 1500); // Pause for 1.5 seconds before starting the battle
  }

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
      showNonBattleElements(); // Show elements when the game ends
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
          shiftAnimalsInLineup(battleLineup); // Shift player's team to fill the gap
          shiftAnimalsInLineup(enemyLineup); // Shift enemy team to fill the gap
          renderTeams(); // Update the visuals after shifting
        } else {
          if (enemyAnimal.health <= 0) {
            console.log(`Enemy's ${enemyAnimal.name} died`);
            enemyLineup[enemyAnimalIndex] = null;
            shiftAnimalsInLineup(enemyLineup); // Shift enemy team
            renderTeams(); // Update the visuals after shifting
          }
          if (playerAnimal.health <= 0) {
            console.log(`User's ${playerAnimal.name} died`);
            battleLineup[playerAnimalIndex] = null;
            shiftAnimalsInLineup(battleLineup); // Shift player's team
            renderTeams(); // Update the visuals after shifting
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
      showNonBattleElements(); // Show elements after game ends
      return;
    }
    if (!enemyLineup.some((animal) => animal)) {
      console.log("You win!");
      showNonBattleElements(); // Show elements after game ends
      return;
    }

    turnCount++;
    setTimeout(playTurn, 2500); // Delay between turns
  }

  pauseBeforeFirstTurn(); // Call the function to introduce a pause before the first round
}

// Function to shift the lineup when an animal dies
function shiftAnimalsInLineup(lineup) {
  // Remove any null values and shift animals left
  let shiftedLineup = lineup.filter((animal) => animal !== null);
  while (shiftedLineup.length < maxSlots) {
    shiftedLineup.push(null); // Fill remaining slots with null
  }
  for (let i = 0; i < maxSlots; i++) {
    lineup[i] = shiftedLineup[i]; // Update the original lineup
  }
}
