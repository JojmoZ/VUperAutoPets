let enemyLineup = [null, null, null, null, null];
let originalBattleLineup = [];
let lives = parseInt(localStorage.getItem("lives")) || 3;
let hearts = [
  document.getElementById("heart1"),
  document.getElementById("heart2"),
  document.getElementById("heart3"),
];
let middleHeart = document.getElementById("middleHeart");

function saveBattleLineup() {
  localStorage.setItem("battleLineup", JSON.stringify(battleLineup));
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
  const iconSize = 40;
  battleLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => {
        ctx.drawImage(
          img,
          teamOffsetX + (maxSlots - 1 - index) * 100,
          commonY,
          80,
          80
        );
        drawAnimalStats(
          animal,
          teamOffsetX + (maxSlots - 1 - index) * 100,
          commonY,
          iconSize
        );
      };
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => {
        ctx.drawImage(img, enemyOffsetX + index * 100, commonY, 80, 80);
        drawAnimalStats(animal, enemyOffsetX + index * 100, commonY, iconSize);
      };
    }
  });
}

function drawAnimalStats(animal, xPos, yPos, iconSize) {
  const fistImg = new Image();
  fistImg.src = "../assets/fist.png";
  fistImg.onload = () => {
    ctx.drawImage(fistImg, xPos, yPos + 60, iconSize, iconSize);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`${animal.attack}`, xPos + 15, yPos + 85);
  };
  const heartImg = new Image();
  heartImg.src = "../assets/heart.png";
  heartImg.onload = () => {
    ctx.drawImage(heartImg, xPos + 40, yPos + 60, iconSize, iconSize);
    ctx.fillText(`${animal.health}`, xPos + 55, yPos + 85);
  };
}

document
  .getElementById("startBattleButton")
  .addEventListener("click", function () {
    backupLineup();
    shiftAnimalsToFront();
    generateEnemyTeam();
    renderTeams();
    hideNonBattleElements();
    showCanvas();
    simulateBattle();
  });

function backupLineup() {
  originalBattleLineup = [...battleLineup];
}

function shiftAnimalsToFront() {
  const shiftedLineup = battleLineup.filter((animal) => animal !== null);
  while (shiftedLineup.length < maxSlots) {
    shiftedLineup.push(null);
  }
  battleLineup = [...shiftedLineup];
}

function restoreOriginalLineup() {
  battleLineup = [...originalBattleLineup];
  renderBattleSlots();
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
      checkGameOver(playerSurvivors, enemySurvivors);
      return;
    }
    const playerAnimalIndex = battleLineup.findIndex(
      (animal) => animal !== null
    );
    const playerAnimal = battleLineup[playerAnimalIndex];
    const enemyAnimalIndex = enemyLineup.findIndex((animal) => animal !== null);
    const enemyAnimal = enemyLineup[enemyAnimalIndex];
    if (playerAnimal && enemyAnimal) {
      animateHeadbutt(playerAnimal, enemyAnimal, () => {
        enemyAnimal.health -= playerAnimal.attack;
        playerAnimal.health -= enemyAnimal.attack;
        handleBothDeaths(playerAnimal, enemyAnimal, () => {
          turnCount++;
          setTimeout(playTurn, 500);
        });
      });
    }
  }

  pauseBeforeFirstTurn();
}

function checkGameOver(playerSurvivors, enemySurvivors) {
  if (playerSurvivors > enemySurvivors) {
    alert("You won this battle!");
    showNonBattleElements();
    location.reload();
  } else if (playerSurvivors < enemySurvivors) {
    loseLife();
  } else {
    alert("It's a draw!");
    showNonBattleElements();
    location.reload();
  }
}

function loseLife() {
  if (lives > 0) {
    middleHeart.src = "../assets/heart.png";
    middleHeart.classList.remove("hidden");
    setTimeout(() => {
      middleHeart.src = "../assets/semibroken.png";
    }, 500);
    setTimeout(() => {
      middleHeart.src = "../assets/broken heart.png";
      middleHeart.classList.add("hidden");
      hearts[lives - 1].src = "../assets/broken heart.png";
      lives--;
      localStorage.setItem("lives", lives);
      if (lives <= 0) {
        showDefeatScreen();
      } else {
        showNonBattleElements();
        location.reload();
      }
    }, 1500);
  }
}

function showDefeatScreen() {
  const defeatScreen = document.getElementById("defeatScreen");
  defeatScreen.classList.remove("hidden");
  setTimeout(() => {
    resetGame();
    window.location.href = "/home/homepage.html";
  }, 3000);
}

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

function resetGame() {
  battleLineup = [null, null, null, null, null];
  enemyLineup = [null, null, null, null, null];
  localStorage.removeItem("randomAnimals");
  coins = 10;
  updateCoinsDisplay();
  if (lives <= 0) {
    lives = 3;
    localStorage.setItem("lives", lives);
    hearts.forEach((heart) => {
      heart.src = "../assets/heart.png";
    });
  }
  renderBattleSlots();
  renderRandomAnimals();
  saveBattleLineup();
  saveRandomAnimals();
  showNonBattleElements();
}
