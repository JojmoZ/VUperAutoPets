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
let coins = parseInt(localStorage.getItem("gamecoins")) || 11;
document.getElementById("coins").textContent = `Coins: ${coins}`;
const maxShopAnimals = 3;
const maxSlots = 5;
let shopAnimals = [
  { name: "Ant", attack: 2, health: 1, cost: 2, img: "../assets/Ant.webp" },
  { name: "Fish", attack: 2, health: 3, cost: 5, img: "../assets/Fish.webp" },
  { name: "Lion", attack: 3, health: 4, cost: 7, img: "../assets/Lion.webp" },
  { name: "Pig", attack: 3, health: 1, cost: 3, img: "../assets/Pig.webp" },
  { name: "Turtle",attack: 1, health: 2, cost: 4, img: "../assets/Turtle.webp",},
  { name: "Elephant",attack: 8, health: 7, cost: 5,img: "../assets/Elephant.webp",
  },
];
let middleHeart = document.getElementById("middleHeart");
let lives = parseInt(localStorage.getItem("lives")) || 3;
let hearts = [
  document.getElementById("heart1"),
  document.getElementById("heart2"),
  document.getElementById("heart3"),
];
let originalBattleLineup = []; 
function saveRandomAnimals() {
  localStorage.setItem("randomAnimals", JSON.stringify(randomAnimals));
}
function rollfirst(){
  console.log("a")
   const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
   if(ownedAnimals == null){
     alert("GK PUNYA OWNED ANIMALS");
     alert("redirecting");
     setTimeout(() => {
       window.location.href = "/home/homepage.html"; // Redirect to homepage
     }, 3000); // Wait for 3 seconds before redirecting
   }else if(ownedAnimals.length ==0){
     alert("GK PUNYA OWNED ANIMALS");
     alert("redirecting");
     setTimeout(() => {
       window.location.href = "/home/homepage.html"; // Redirect to homepage
     }, 3000); // Wait for 3 seconds before redirecting
   }else{
     const shuffledAnimals = ownedAnimals
       ? ownedAnimals.sort(() => Math.random() - 0.5)
       : shopAnimals.sort(() => Math.random() - 0.5);
     randomAnimals = shuffledAnimals.slice(0, maxShopAnimals);
    renderRandomAnimals();
    saveRandomAnimals();
   }
  
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
    animalDiv.setAttribute("data-index", index);

    const animalImage = document.createElement("img");
    animalImage.src = animal.img;
    animalImage.alt = animal.name;
    animalImage.setAttribute("draggable", true); 
    animalImage.addEventListener("dragstart", dragStart);

    const statContainer = document.createElement("div");
    statContainer.classList.add("stat-container");
    const attack = document.createElement("p");
    const health = document.createElement("p");
    // statContainer.innerHTML = `${animal.attack}/${animal.health}`; 
    attack.textContent = `${animal.attack}`;
    health.textContent = `${animal.health}`;
    statContainer.appendChild(attack);
    statContainer.appendChild(health);

    animalDiv.appendChild(animalImage); // Append the img
    animalDiv.appendChild(statContainer); // Append the stats container
    randomAnimalsContainer.appendChild(animalDiv);
  });
}



function saveBattleLineup() {
  localStorage.setItem("battleLineup", JSON.stringify(battleLineup));
}
function dragStart(event) {
  const index = event.target.closest(".animal").getAttribute("data-index");
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
    event.target.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}" style="position: absolute; width: 80px; height: 80px; left: 10px;">`;
    coins -= selectedAnimal.cost;
    updateCoinsDisplay();
    randomAnimals.splice(animalIndex, 1);
    renderRandomAnimals();
    saveBattleLineup();
    saveRandomAnimals();
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
        const fistImg = new Image();
        fistImg.src = "../assets/fist.png";
        fistImg.onload = () => {
          ctx.drawImage(
            fistImg,
            teamOffsetX + (maxSlots - 1 - index) * 100,
            commonY + 60,
            iconSize,
            iconSize
          );
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(
            `${animal.attack}`,
            teamOffsetX + (maxSlots - 1 - index) * 100 + 17,
            commonY + 85
          );
        };
        const heartImg = new Image();
        heartImg.src = "../assets/heart.png";
        heartImg.onload = () => {
          ctx.drawImage(
            heartImg,
            teamOffsetX + (maxSlots - 1 - index) * 100 + 50,
            commonY + 60,
            iconSize,
            iconSize
          );
          ctx.fillText(
            `${animal.health}`,
            teamOffsetX + (maxSlots - 1 - index) * 100 + 65,
            commonY + 85
          );
        };
      };
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => {
        ctx.drawImage(img, enemyOffsetX + index * 100, commonY, 80, 80);
        const fistImg = new Image();
        fistImg.src = "../assets/fist.png";
        fistImg.onload = () => {
          ctx.drawImage(
            fistImg,
            enemyOffsetX + index * 100,
            commonY + 60,
            iconSize,
            iconSize
          );
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(
            `${animal.attack}`,
            enemyOffsetX + index * 100 + 17,
            commonY + 85
          );
        };
        const heartImg = new Image();
        heartImg.src = "../assets/heart.png";
        heartImg.onload = () => {
          ctx.drawImage(
            heartImg,
            enemyOffsetX + index * 100 + 50,
            commonY + 60,
            iconSize,
            iconSize
          );
          ctx.fillText(
            `${animal.health}`,
            enemyOffsetX + index * 100 + 65,
            commonY + 85
          );
        };
      };
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
document.getElementById("startBattleButton").addEventListener("click", function () {
    backupLineup(); // Backup the lineup before battle
    shiftAnimalsToFront(); // Shift animals to the front
    generateEnemyTeam(); // Generate enemy team
    renderTeams(); // Render both teams (player and enemy)
    hideNonBattleElements();
    showCanvas();
    simulateBattle(); // Start the battle
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
  console.log("ab")
  updateHeartsDisplay();  
  if (localStorage.getItem("randomAnimals")) {
    randomAnimals = JSON.parse(localStorage.getItem("randomAnimals"));
    renderRandomAnimals();
  } else {
    rollfirst();
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
function backupLineup() {
  originalBattleLineup = [...battleLineup]; // Create a backup of the original lineup
}
function shiftAnimalsToFront() {
  const shiftedLineup = battleLineup.filter((animal) => animal !== null); // Filter out null values
  while (shiftedLineup.length < maxSlots) {
    shiftedLineup.push(null); // Add nulls to the end to maintain maxSlots length
  }
  battleLineup = [...shiftedLineup]; // Update the battle lineup to the shifted one
}
function restoreOriginalLineup() {
  battleLineup = [...originalBattleLineup]; // Restore the backup lineup
  renderBattleSlots(); // Re-render the slots with the restored lineup
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
  let alpha = 1.0; 
  const fadeDuration = 50; 
  const displayDuration = 50; 
  const maxFontSize = 40; 
  const minFontSize = 10;
  const commonY = 150;
  const playerDamageOffsetX = -25; 
  const playerDamageOffsetY = -1;
  const enemyDamageOffsetX = 35; 
  const enemyDamageOffsetY = -4; 
  let currentFrame = 0;
  const totalFrames = 30; 
  function drawExpandingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam(); 
    ctx.drawImage(playerImg, playerX, commonY, 60, 60);
    ctx.fillText(`A:${playerDamage}/H:${enemyDamage}`, playerX, commonY + 80);
    ctx.drawImage(enemyImg, enemyX, commonY, 60, 60);
    ctx.fillText(`A:${enemyDamage}/H:${playerDamage}`, enemyX, commonY + 80);
    ctx.save();
    const progress = currentFrame / totalFrames;
    const fontSize = minFontSize + progress * (maxFontSize - minFontSize); 
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "red";
    ctx.globalAlpha = alpha;
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
      requestAnimationFrame(drawExpandingDamage); 
    } else {
      setTimeout(() => {
        alpha = 1.0;
        currentFrame = 0; 
        requestAnimationFrame(drawShrinkingDamage); 
      }, displayDuration);
    }
  }

  function drawShrinkingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    renderFullTeam();
    ctx.drawImage(playerImg, playerX, commonY, 60, 60);
    ctx.fillText(`A:${playerDamage}/H:${enemyDamage}`, playerX, commonY + 80);
    ctx.drawImage(enemyImg, enemyX, commonY, 60, 60);
    ctx.fillText(`A:${enemyDamage}/H:${playerDamage}`, enemyX, commonY + 80);

    ctx.save();
    const progress = currentFrame / totalFrames;
    const fontSize = maxFontSize - progress * (maxFontSize - minFontSize); 
    alpha = 1 - progress; 
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "red";
    ctx.globalAlpha = alpha;
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
      requestAnimationFrame(drawShrinkingDamage); 
    } else {
      ctx.globalAlpha = 1.0; 
      onComplete(); 
    }
  }
  drawExpandingDamage();
}
function renderFullTeam() {
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

      checkGameOver(playerSurvivors, enemySurvivors);
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
                checkGameOver(
                  battleLineup.filter((animal) => animal !== null).length,
                  enemyLineup.filter((animal) => animal !== null).length
                );
              }, 1500);
              return;
            }

            turnCount++;
            setTimeout(playTurn, 500);
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
function updateHeartsDisplay() {
  hearts.forEach((heart, index) => {
    if (index < lives) {
      heart.src = "../assets/heart.png"; // Full heart
    } else {
      heart.src = "../assets/broken heart.png"; // Broken heart
    }
  });
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
        location.reload()
      }
    }, 1500);
  }
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
function checkGameOver(playerSurvivors, enemySurvivors) {
  if (playerSurvivors > enemySurvivors) {
    console.log("User wins!");
    alert("You won this battle! Continue to the next.");
    showNonBattleElements();
    location.reload();
    
  } else if (playerSurvivors < enemySurvivors) {
    loseLife(); 
    
  } else {
    console.log("It's a draw!");
    alert("It's a draw! Continue to the next battle.");
   showNonBattleElements();
   location.reload();
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
