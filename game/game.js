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
function saveBattleLineup() {
  localStorage.setItem("battleLineup", JSON.stringify(battleLineup));
}
function dragStart(event) {
  const index = event.target.getAttribute("data-index");
  event.dataTransfer.setData("text/plain", index);
}
function handleDrop(event) {
  event.preventDefault();
  const slotIndex = event.target.getAttribute("data-slot");
  const reversedSlotIndex = maxSlots - 1 - slotIndex;
  const animalIndex = event.dataTransfer.getData("text/plain");
  const selectedAnimal = randomAnimals[animalIndex];
  if (!battleLineup[reversedSlotIndex] && coins >= selectedAnimal.cost) {
    battleLineup[reversedSlotIndex] = selectedAnimal;
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
function renderBattleSlots() {
  const battleSlots = document.querySelectorAll(".battle-slot");
  battleSlots.forEach((slot, index) => {
    const animal = battleLineup[maxSlots - 1 - index];
    if (animal) {
      slot.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="width: 80px; height: 80px;">`;
    } else {
      slot.innerHTML = "";
    }
  });
}
function renderTeams() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const teamOffsetX = 100;
  const commonY = 150;
  const enemyOffsetX = canvas.width - 550;
  battleLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () =>
        ctx.drawImage(
          img,
          teamOffsetX + (maxSlots - 1 - index) * 100,
          commonY,
          60,
          60
        );
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        teamOffsetX + (maxSlots - 1 - index) * 100,
        commonY + 80
      );
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () =>
        ctx.drawImage(img, enemyOffsetX + index * 100, commonY, 60, 60);
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        enemyOffsetX + index * 100,
        commonY + 80
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
    hideNonBattleElements();
    showCanvas();
    simulateBattle();
  });
function hideNonBattleElements() {
  document.getElementById("battleSlotsContainer").classList.add("hidden");
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("backArrow").classList.add("hidden");
}
function showCanvas() {
  document.getElementById("battleCanvas").classList.remove("hidden");
}
function hideCanvas() {
  document.getElementById("battleCanvas").classList.add("hidden");
}
function showNonBattleElements() {
  document.getElementById("battleSlotsContainer").classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("backArrow").classList.remove("hidden");
  hideCanvas();
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
    renderBattleSlots();
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
function animateHeadbutt(playerAnimal, enemyAnimal, onComplete) {
  const playerStartX = 100 + (maxSlots - 1) * 100;
  const playerY = 150;
  const enemyStartX = canvas.width - 550; 
  const enemyY = 150;
  const centerX = canvas.width / 2 - 60; 
  const duration = 1000; 
  const frameRate = 60; 
  const totalFrames = (duration / 1000) * frameRate;
  let currentFrame = 0;
  const playerImg = new Image();
  playerImg.src = playerAnimal.img;
  const enemyImg = new Image();
  enemyImg.src = enemyAnimal.img;
  playerImg.onload = () => {
    enemyImg.onload = () => {
      requestAnimationFrame(animate);
    };
  };
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam(); 
    const progress = easeInOutQuad(currentFrame / totalFrames);
    const playerX = playerStartX - (playerStartX - centerX) * progress;
    const enemyX = enemyStartX + (centerX + 60 - enemyStartX) * progress;
    ctx.drawImage(playerImg, playerX, playerY, 60, 60);
    ctx.fillText(
      `A:${playerAnimal.attack}/H:${playerAnimal.health}`,
      playerX,
      playerY + 80
    );

    ctx.drawImage(enemyImg, enemyX, enemyY, 60, 60);
    ctx.fillText(
      `A:${enemyAnimal.attack}/H:${enemyAnimal.health}`,
      enemyX,
      enemyY + 80
    );
    if (progress > 0.8) {
      const bandageSize = 60;
      const bandageImg = new Image();
      bandageImg.src = "../assets/hurt.png";
      ctx.drawImage(
        bandageImg,
        playerX + 10,
        playerY,
        bandageSize,
        bandageSize
      );
      ctx.drawImage(bandageImg, enemyX + 10, enemyY, bandageSize, bandageSize);
    }
    currentFrame++;
    if (currentFrame <= totalFrames) {
      requestAnimationFrame(animate);
    } else {
       showDamage(
         playerX,
         playerAnimal.attack,
         enemyX,
         enemyAnimal.attack,
         playerImg,
         enemyImg,
         () => {
           animateReturn(playerStartX, playerY, enemyStartX, enemyY);
         }
       );
    }
  }
  function animateReturn(playerStartX, playerY, enemyStartX, enemyY) {
    let returnFrame = 0;
    const returnFrames = totalFrames; 
    function animateBack() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderFullTeam(); 
      const progress = easeInOutQuad(returnFrame / returnFrames);
      const playerX = centerX + (playerStartX - centerX) * progress;
      const enemyX = centerX + 60 + (enemyStartX - centerX - 60) * progress;
      ctx.drawImage(playerImg, playerX, playerY, 60, 60);
      ctx.fillText(
        `A:${playerAnimal.attack}/H:${playerAnimal.health}`,
        playerX,
        playerY + 80
      );

      ctx.drawImage(enemyImg, enemyX, enemyY, 60, 60);
      ctx.fillText(
        `A:${enemyAnimal.attack}/H:${enemyAnimal.health}`,
        enemyX,
        enemyY + 80
      );
      returnFrame++;
      if (returnFrame <= returnFrames) {
        requestAnimationFrame(animateBack);
      } else {
        onComplete();
      }
    }
    requestAnimationFrame(animateBack);
  }
}

function showDamage(
  playerX,
  playerDamage,
  enemyX,
  enemyDamage,
  playerImg,
  enemyImg,
  onComplete
) {
  let alpha = 1.0; // Start fully opaque
  const fadeDuration = 1000; // Time for the damage to fade out
  const displayDuration = 1000; // How long the damage stays on screen
  const maxFontSize = 40; // The largest size of the expanding text
  const minFontSize = 10; // The initial size of the expanding text
  const commonY = 150;

  // Adjust the offset for damage text positioning
  const playerDamageOffsetX = -25; // Move damage to the left for the player
  const playerDamageOffsetY = -1; // Move damage slightly above the player's head
  const enemyDamageOffsetX = 35; // Move damage to the right for the enemy
  const enemyDamageOffsetY = -4; // Move damage slightly above the enemy's head

  // Variable to track current frame for size and transparency animation
  let currentFrame = 0;
  const totalFrames = 30; // How many frames to take for expanding

  function drawExpandingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    renderFullTeam(); // Redraw the entire team

    // Redraw the player and enemy in their positions during headbutt
    ctx.drawImage(playerImg, playerX, commonY, 60, 60);
    ctx.fillText(`A:${playerDamage}/H:${enemyDamage}`, playerX, commonY + 80);
    ctx.drawImage(enemyImg, enemyX, commonY, 60, 60);
    ctx.fillText(`A:${enemyDamage}/H:${playerDamage}`, enemyX, commonY + 80);

    ctx.save();
    const progress = currentFrame / totalFrames;
    const fontSize = minFontSize + progress * (maxFontSize - minFontSize); // Text expands
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "red";
    ctx.globalAlpha = alpha;

    // Adjusted damage number positions
    ctx.fillText(
      `-${enemyDamage}`,
      playerX + playerDamageOffsetX,
      commonY + playerDamageOffsetY
    ); // Damage to player
    ctx.fillText(
      `-${playerDamage}`,
      enemyX + enemyDamageOffsetX,
      commonY + enemyDamageOffsetY
    ); // Damage to enemy
    ctx.restore();

    if (currentFrame < totalFrames) {
      currentFrame++;
      requestAnimationFrame(drawExpandingDamage); // Continue expanding
    } else {
      setTimeout(() => {
        alpha = 1.0; // Reset alpha for shrinking
        currentFrame = 0; // Reset for shrinking phase
        requestAnimationFrame(drawShrinkingDamage); // Shrink after display duration
      }, displayDuration);
    }
  }

  function drawShrinkingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    renderFullTeam(); // Redraw the entire team

    // Redraw the player and enemy in their positions
    ctx.drawImage(playerImg, playerX, commonY, 60, 60);
    ctx.fillText(`A:${playerDamage}/H:${enemyDamage}`, playerX, commonY + 80);
    ctx.drawImage(enemyImg, enemyX, commonY, 60, 60);
    ctx.fillText(`A:${enemyDamage}/H:${playerDamage}`, enemyX, commonY + 80);

    ctx.save();
    const progress = currentFrame / totalFrames;
    const fontSize = maxFontSize - progress * (maxFontSize - minFontSize); // Shrink text
    alpha = 1 - progress; // Fade out text as it shrinks
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "red";
    ctx.globalAlpha = alpha;

    // Adjusted damage number positions for shrinking phase
    ctx.fillText(
      `-${enemyDamage}`,
      playerX + playerDamageOffsetX,
      commonY + playerDamageOffsetY
    );
    ctx.fillText(
      `-${playerDamage}`,
      enemyX + enemyDamageOffsetX,
      commonY + enemyDamageOffsetY
    );
    ctx.restore();

    if (currentFrame < totalFrames) {
      currentFrame++;
      requestAnimationFrame(drawShrinkingDamage); // Continue shrinking and fading out
    } else {
      // Fully complete animation, call onComplete
      ctx.globalAlpha = 1.0; // Reset transparency
      onComplete(); // Call the completion callback to continue the game
    }
  }

  // Start with the expanding phase
  drawExpandingDamage();
}




function renderFullTeam() {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  const commonY = 150;
  const teamOffsetX = 100;
  const enemyOffsetX = canvas.width - 550;
  battleLineup.forEach((animal, index) => {
    if (animal && index !== 0) {
      ctx.drawImage(
        getAnimalImage(animal.img),
        teamOffsetX + (maxSlots - 1 - index) * 100,
        commonY,
        60,
        60
      );
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        teamOffsetX + (maxSlots - 1 - index) * 100,
        commonY + 80
      );
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal && index !== 0) {
      ctx.drawImage(
        getAnimalImage(animal.img),
        enemyOffsetX + index * 100,
        commonY,
        60,
        60
      );
      ctx.fillText(
        `A:${animal.attack}/H:${animal.health}`,
        enemyOffsetX + index * 100,
        commonY + 80
      );
    }
  });
}
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function getAnimalImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}
function animateDeathFlyOff(animal, index, teamType, onComplete) {
  const img = new Image();
  img.src = animal.img;
  let currentFrame = 0;
  const totalFrames = 60;
  let startX, startY;
  if (teamType === "player") {
    startX = 100 + (maxSlots - 1 - index) * 100;
    startY = 150;
  } else {
    startX = canvas.width - 550 + index * 100;
    startY = 150;
  }
  const endX = teamType === "player" ? -100 : canvas.width + 100;
  const controlPointX = (startX + endX) / 2;
  const controlPointY = startY - 400;
  function animate() {
    const previousX =
      (1 - currentFrame / totalFrames) *
        (1 - currentFrame / totalFrames) *
        startX +
      2 *
        (1 - currentFrame / totalFrames) *
        (currentFrame / totalFrames) *
        controlPointX +
      (currentFrame / totalFrames) * (currentFrame / totalFrames) * endX;
    const previousY =
      (1 - currentFrame / totalFrames) *
        (1 - currentFrame / totalFrames) *
        startY +
      2 *
        (1 - currentFrame / totalFrames) *
        (currentFrame / totalFrames) *
        controlPointY +
      (currentFrame / totalFrames) *
        (currentFrame / totalFrames) *
        (startY + 100);
    ctx.clearRect(previousX - 30, previousY - 30, 120, 120);
    renderFullTeam();
    const progress = currentFrame / totalFrames;
    const curveX =
      (1 - progress) * (1 - progress) * startX +
      2 * (1 - progress) * progress * controlPointX +
      progress * progress * endX;
    const curveY =
      (1 - progress) * (1 - progress) * startY +
      2 * (1 - progress) * progress * controlPointY +
      progress * progress * (startY + 100);
    ctx.drawImage(img, curveX, curveY, 60, 60);

    currentFrame++;
    if (currentFrame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  }
  animate();
}
function handleBothDeaths(playerAnimal, enemyAnimal, onComplete) {
  const deathPromises = [];
  if (playerAnimal.health <= 0) {
    deathPromises.push(
      new Promise((resolve) => {
        animateDeathFlyOff(
          playerAnimal,
          battleLineup.indexOf(playerAnimal),
          "player",
          resolve
        );
      })
    );
  }
  if (enemyAnimal.health <= 0) {
    deathPromises.push(
      new Promise((resolve) => {
        animateDeathFlyOff(
          enemyAnimal,
          enemyLineup.indexOf(enemyAnimal),
          "enemy",
          resolve
        );
      })
    );
  }
  Promise.all(deathPromises).then(() => {
    if (enemyAnimal.health <= 0) {
      console.log(`Enemy's ${enemyAnimal.name} died`);
      enemyLineup[enemyLineup.indexOf(enemyAnimal)] = null;
      shiftAnimalsInLineup(enemyLineup);
    }
    if (playerAnimal.health <= 0) {
      console.log(`User's ${playerAnimal.name} died`);
      battleLineup[battleLineup.indexOf(playerAnimal)] = null;
      shiftAnimalsInLineup(battleLineup);
    }
    renderTeams();
    setTimeout(() => {
      onComplete();
    }, 500);
  });
}

function simulateBattle() {
  console.clear();
  let turnCount = 1;
  const maxTurns = 10;
  renderTeams();

  function pauseBeforeFirstTurn() {
    setTimeout(playTurn, 1500);
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
      showNonBattleElements();
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
        animateHeadbutt(playerAnimal, enemyAnimal, () => {
          enemyAnimal.health -= playerAnimal.attack;
          playerAnimal.health -= enemyAnimal.attack;

          handleBothDeaths(playerAnimal, enemyAnimal, () => {
            if (
              !battleLineup.some((animal) => animal) ||
              !enemyLineup.some((animal) => animal)
            ) {
              setTimeout(() => {
                console.log("Game over.");
                renderTeams();
                showNonBattleElements();
              }, 1500);
              return;
            }

            turnCount++;
            setTimeout(playTurn, 1500);
          });
        });
      }
    }
  }

  pauseBeforeFirstTurn();
}
function shiftAnimalsInLineup(lineup) {
  let shiftedLineup = lineup.filter((animal) => animal !== null);
  while (shiftedLineup.length < maxSlots) {
    shiftedLineup.push(null);
  }
  for (let i = 0; i < maxSlots; i++) {
    lineup[i] = shiftedLineup[i];
  }
}
