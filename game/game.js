const canvas = document.getElementById("battleCanvas");
const curtainTop = document.getElementById("curtainTop");
const curtainBottom = document.getElementById("curtainBottom");
let ctx = canvas.getContext("2d");
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
let shopAnimals = [];

fetch("../assets/shopAnimals.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    shopAnimals = data;
    console.log("shopAnimals loaded:", shopAnimals);
  })
  .catch((error) => console.error("Error loading shopAnimals:", error));
let lastFrameTime = performance.now();
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
function rollfirst() {
  console.log("a");
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
  if (ownedAnimals == null) {
    alert("GK PUNYA OWNED ANIMALS");
    alert("redirecting");
    setTimeout(() => {
      window.location.href = "/home/homepage.html";
    }, 3000);
  } else if (ownedAnimals.length == 0) {
    alert("GK PUNYA OWNED ANIMALS");
    alert("redirecting");
    setTimeout(() => {
      window.location.href = "/home/homepage.html";
    }, 3000);
  } else {
    const shuffledAnimals = ownedAnimals
      ? ownedAnimals.sort(() => Math.random() - 0.5)
      : shopAnimals.sort(() => Math.random() - 0.5);
    randomAnimals = shuffledAnimals.slice(0, maxShopAnimals);
    renderRandomAnimals();
    saveRandomAnimals();
  }
}
function showCurtains() {
  curtainTop.style.visibility = "visible";
  curtainBottom.style.visibility = "visible";
}
function hideCurtains() {
  curtainTop.style.visibility = "hidden";
  curtainBottom.style.visibility = "hidden";
}
function closeCurtains() {
  showCurtains();
  curtainTop.style.height = "50vh";
  curtainBottom.style.height = "50vh";
}
function openCurtains(onComplete) {
  setTimeout(() => {
    curtainTop.style.height = "0";
    curtainBottom.style.height = "0";
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  }, 500);
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
    animalImage.addEventListener("dragend", hideTrashBin);

    const statContainer = document.createElement("div");
    statContainer.classList.add("stat-container");
    const attack = document.createElement("p");
    const health = document.createElement("p");
    attack.textContent = `${animal.attack}`;
    health.textContent = `${animal.health}`;
    statContainer.appendChild(attack);
    statContainer.appendChild(health);
    animalDiv.appendChild(animalImage);
    animalDiv.appendChild(statContainer);
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
  const slotIndex = parseInt(event.currentTarget.getAttribute("data-slot"), 10); // Use event.currentTarget
  const reversedSlotIndex = maxSlots - 1 - slotIndex;
  const data = event.dataTransfer.getData("text/plain");
  const draggedElement = document.querySelector(`[data-index="${data}"]`);

  if (draggedElement) {
    const animalIndex = parseInt(data, 10);
    const selectedAnimal = randomAnimals[animalIndex];
    if (!battleLineup[reversedSlotIndex] && coins >= selectedAnimal.cost) {
      battleLineup[reversedSlotIndex] = selectedAnimal;
      coins -= selectedAnimal.cost;
      updateCoinsDisplay();
      randomAnimals.splice(animalIndex, 1);
      renderRandomAnimals();
      saveBattleLineup();
      saveRandomAnimals();
      renderBattleSlots();
    } else {
      alert("Not enough coins or slot is already filled!");
    }
  } else {
    const animalIndex = parseInt(data, 10);
    const draggedFromSlot = battleLineup[animalIndex];
    if (draggedFromSlot) {
      const temp = battleLineup[reversedSlotIndex];
      battleLineup[reversedSlotIndex] = draggedFromSlot;
      battleLineup[animalIndex] = temp;
      renderBattleSlots();
      saveBattleLineup();
    }
  }
}
function handleDragOver(event) {
  event.preventDefault();
}
function renderBattleSlots() {
  const battleSlots = document.querySelectorAll(".battle-slot");
  battleSlots.forEach((slot, index) => {
    slot.setAttribute("data-slot", index);
    const animal = battleLineup[maxSlots - 1 - index];
    if (animal) {
      slot.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="width: 5rem; height: 5rem;" draggable="true">`;

      // Attach drag events to the image
      const imgElement = slot.querySelector("img");
      imgElement.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", maxSlots - 1 - index); // Store slot index
        showTrashBin();
      });
      imgElement.addEventListener("dragend", hideTrashBin);
    } else {
      slot.innerHTML = "";
    }
  });
}
function renderTeams() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const teamOffsetX = 100;
  const commonY = 210;
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
          ctx.font = "1rem Arial";
          let attackText = `${animal.attack}`;
          let attackTextWidth = ctx.measureText(attackText).width;
          let attackX =
            teamOffsetX +
            (maxSlots - 1 - index) * 100 +
            20 -
            attackTextWidth / 2;
          ctx.fillText(attackText, attackX, commonY + 85);
        };
        const heartImg = new Image();
        heartImg.src = "../assets/heart.png";
        heartImg.onload = () => {
          ctx.drawImage(
            heartImg,
            teamOffsetX + (maxSlots - 1 - index) * 100 + 40,
            commonY + 60,
            iconSize,
            iconSize
          );
          ctx.fillStyle = "white";
          ctx.font = "1rem Arial";
          let healthText = `${animal.health}`;
          let healthTextWidth = ctx.measureText(healthText).width;
          let healthX =
            teamOffsetX +
            (maxSlots - 1 - index) * 100 +
            60 -
            healthTextWidth / 2;
          ctx.fillText(healthText, healthX, commonY + 85);
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
          ctx.font = "1rem Arial";
          let attackText = `${animal.attack}`;
          let attackTextWidth = ctx.measureText(attackText).width;
          let attackX = enemyOffsetX + index * 100 + 20 - attackTextWidth / 2;
          ctx.fillText(attackText, attackX, commonY + 85);
        };
        const heartImg = new Image();
        heartImg.src = "../assets/heart.png";
        heartImg.onload = () => {
          ctx.drawImage(
            heartImg,
            enemyOffsetX + index * 100 + 40,
            commonY + 60,
            iconSize,
            iconSize
          );
          ctx.fillStyle = "white";
          ctx.font = "1rem Arial";
          let healthText = `${animal.health}`;
          let healthTextWidth = ctx.measureText(healthText).width;
          let healthX = enemyOffsetX + index * 100 + 60 - healthTextWidth / 2;
          ctx.fillText(healthText, healthX, commonY + 85);
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
let playing = false;
document
  .getElementById("startBattleButton")
  .addEventListener("click", function () {
    if (!playing) {
      showCurtains();
      playing = true;
      closeCurtains();
      setTimeout(() => {
        backupLineup();
        shiftAnimalsToFront();
        generateEnemyTeam();
        hideNonBattleElements();
        hideCanvas();
        openCurtains(() => {
          showCanvas();
          animateAnimalsIntoPosition(() => {
            simulateBattle();
          });
        });
      }, 1000);
    }
  });
function animateAnimalsIntoPosition(onComplete) {
  const teamOffsetX = 100;
  const enemyOffsetX = canvas.width - 550;
  const commonY = 210;
  const bounceHeight = 30; // Height of the bounce effect
  const duration = 2000; // Extended duration for the entire animation in ms
  const bounceFrequency = 5; // Increase this number for more bounces

  // Preload all images for the player's and enemy's lineup
  const preloadedPlayerImages = battleLineup.map((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => console.log(`Player pet ${index} loaded`);
      return img;
    }
    return null;
  });

  const preloadedEnemyImages = enemyLineup.map((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => console.log(`Enemy pet ${index} loaded`);
      return img;
    }
    return null;
  });

  let currentFrame = 0;
  let lastFrameTime = performance.now();

  // Easing function for smoother motion
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animate(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const progress = currentFrame / (duration / 1000); // Use delta time for progress
    const easedProgress = easeOutQuad(progress); // Applying ease-out easing
    const bounceY =
      Math.sin(easedProgress * Math.PI * 2 * bounceFrequency) *
      bounceHeight *
      (1 - easedProgress);

    // Draw each preloaded player image with horizontal slide-in + vertical bounce
    preloadedPlayerImages.forEach((img, index) => {
      if (img) {
        const startX = -80; // Start off-screen to the left
        const endX = teamOffsetX + (maxSlots - 1 - index) * 100;
        const delay = index * 0.2; // Reduced delay interval

        // Apply the delay effect
        const adjustedProgress = Math.min(
          Math.max(easedProgress - delay, 0) / (1 - delay),
          1
        );

        const currentX = startX + (endX - startX) * adjustedProgress;
        const targetY = commonY - bounceY;

        ctx.drawImage(img, currentX, targetY, 80, 80);
      }
    });

    // Draw each preloaded enemy image with horizontal slide-in + vertical bounce
    preloadedEnemyImages.forEach((img, index) => {
      if (img) {
        const startX = canvas.width + 80; // Start off-screen to the right
        const endX = enemyOffsetX + index * 100;
        const delay = index * 0.2; // Reduced delay interval for enemies too

        // Apply the delay effect
        const adjustedProgress = Math.min(
          Math.max(easedProgress - delay, 0) / (1 - delay),
          1
        );

        const currentX = startX - (startX - endX) * adjustedProgress;
        const targetY = commonY - bounceY;

        ctx.drawImage(img, currentX, targetY, 80, 80);
      }
    });

    currentFrame += deltaTime;
    if (currentFrame <= duration / 1000) {
      requestAnimationFrame(animate);
    } else {
      if (onComplete) {
        onComplete(); // Call the onComplete callback when the animation is complete
      }
    }
  }

  // Start the animation loop
  requestAnimationFrame(animate);
}

function showNonBattleElements() {
  document.getElementById("battleSlotsContainer").classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("refreshButton").classList.remove("hidden");
  document.getElementById("startBattleButton").classList.remove("hidden");
  document.getElementById("freezeButton").classList.remove("hidden");
  document.getElementById("backArrow").classList.remove("hidden");
  hideCanvas();
}

function hideNonBattleElements() {
  document.getElementById("battleSlotsContainer").classList.add("hidden");
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("refreshButton").classList.add("hidden");
  document.getElementById("startBattleButton").classList.add("hidden");
  document.getElementById("freezeButton").classList.add("hidden");
  document.getElementById("backArrow").classList.add("hidden");
}
function showCanvas() {
  document.getElementById("battleCanvas").classList.remove("hidden");
}
function hideCanvas() {
  document.getElementById("battleCanvas").classList.add("hidden");
}
function adjustCanvasSize() {
  const canvas = document.getElementById("battleCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.5; // Adjust height based on vh
  ctx = canvas.getContext("2d");
}

document.addEventListener("DOMContentLoaded", function () {
  hideCurtains();
  adjustCanvasSize();
  window.addEventListener("resize", adjustCanvasSize);
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
    const clonedAnimal = { ...randomAnimal };

    if (totalTeamCost >= randomAnimal.cost) {
      enemyLineup.push(clonedAnimal);
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
  const playerY = 210;
  const enemyStartX = canvas.width - 550;
  const enemyY = 210;
  const centerX = canvas.width / 2 - 60;
  const duration = 500; // Duration in milliseconds
  let currentFrame = 0;
  let lastFrameTime = performance.now();

  const playerImg = new Image();
  playerImg.src = playerAnimal.img;

  const enemyImg = new Image();
  enemyImg.src = enemyAnimal.img;

  const fistImg = new Image();
  fistImg.src = "../assets/fist.png";

  const heartImg = new Image();
  heartImg.src = "../assets/heart.png";

  playerImg.onload = () => {
    enemyImg.onload = () => {
      fistImg.onload = () => {
        heartImg.onload = () => {
          requestAnimationFrame(animate);
        };
      };
    };
  };

  function animate(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam();

    const progress = easeInOutQuad(currentFrame / (duration / 1000)); // Use delta time for progress
    const playerX = playerStartX - (playerStartX - centerX) * progress;
    const enemyX = enemyStartX + (centerX + 60 - enemyStartX) * progress;

    ctx.drawImage(playerImg, playerX, playerY, 80, 80);
    ctx.drawImage(fistImg, playerX, playerY + 60, 40, 40);
    ctx.drawImage(heartImg, playerX + 40, playerY + 60, 40, 40);
    ctx.fillStyle = "white";
    ctx.font = "1rem Arial";
    let attackText = `${playerAnimal.attack}`;
    let attackTextWidth = ctx.measureText(attackText).width;
    let attackX = playerX + 20 - attackTextWidth / 2;
    let healthText = `${playerAnimal.health}`;
    let healthTextWidth = ctx.measureText(healthText).width;
    let healthX = playerX + 60 - healthTextWidth / 2;
    ctx.fillText(attackText, attackX, playerY + 85);
    ctx.fillText(healthText, healthX, playerY + 85);

    ctx.drawImage(enemyImg, enemyX, enemyY, 80, 80);
    ctx.drawImage(fistImg, enemyX, enemyY + 60, 40, 40);
    ctx.drawImage(heartImg, enemyX + 40, enemyY + 60, 40, 40);
    ctx.fillStyle = "white";
    ctx.font = "1rem Arial";
    let attackTextEn = `${enemyAnimal.attack}`;
    let attackTextWidthEn = ctx.measureText(attackTextEn).width;
    let attackXEn = enemyX + 20 - attackTextWidthEn / 2;
    let healthTextEn = `${enemyAnimal.health}`;
    let healthTextWidthEn = ctx.measureText(healthTextEn).width;
    let healthXEn = enemyX + 60 - healthTextWidthEn / 2;
    ctx.fillText(attackTextEn, attackXEn, enemyY + 85);
    ctx.fillText(healthTextEn, healthXEn, enemyY + 85);

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

    currentFrame += deltaTime;
    if (currentFrame <= duration / 1000) {
      requestAnimationFrame(animate);
    } else {
      showDamage(
        playerX,
        playerAnimal.attack,
        enemyX,
        enemyAnimal.attack,
        playerImg,
        enemyImg,
        playerAnimal.health,
        enemyAnimal.health,
        () => {
          animateReturn(playerStartX, playerY, enemyStartX, enemyY);
        }
      );
    }
  }

  function animateReturn(playerStartX, playerY, enemyStartX, enemyY) {
    let returnFrame = 0;
    let lastReturnFrameTime = performance.now();
    const returnDuration = duration; // Use the same duration for return animation

    function animateBack(currentTime) {
      const deltaTime = (currentTime - lastReturnFrameTime) / 1000; // Convert to seconds
      lastReturnFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderFullTeam();
      const progress = easeInOutQuad(returnFrame / (returnDuration / 1000)); // Use delta time for progress
      const playerX = centerX + (playerStartX - centerX) * progress;
      const enemyX = centerX + 60 + (enemyStartX - centerX - 60) * progress;

      ctx.drawImage(playerImg, playerX, playerY, 80, 80);
      ctx.drawImage(fistImg, playerX, playerY + 60, 40, 40);
      ctx.drawImage(heartImg, playerX + 40, playerY + 60, 40, 40);
      ctx.fillStyle = "white";
      ctx.font = "1rem Arial";
      let attackText = `${playerAnimal.attack}`;
      let attackTextWidth = ctx.measureText(attackText).width;
      let attackX = playerX + 20 - attackTextWidth / 2;
      let healthText = `${playerAnimal.health}`;
      let healthTextWidth = ctx.measureText(healthText).width;
      let healthX = playerX + 60 - healthTextWidth / 2;
      ctx.fillText(attackText, attackX, playerY + 85);
      ctx.fillText(healthText, healthX, playerY + 85);

      ctx.drawImage(enemyImg, enemyX, enemyY, 80, 80);
      ctx.drawImage(fistImg, enemyX, enemyY + 60, 40, 40);
      ctx.drawImage(heartImg, enemyX + 40, enemyY + 60, 40, 40);
      ctx.fillStyle = "white";
      ctx.font = "1rem Arial";
      let attackTextEn = `${enemyAnimal.attack}`;
      let attackTextWidthEn = ctx.measureText(attackTextEn).width;
      let attackXEn = enemyX + 20 - attackTextWidthEn / 2;
      let healthTextEn = `${enemyAnimal.health}`;
      let healthTextWidthEn = ctx.measureText(healthTextEn).width;
      let healthXEn = enemyX + 60 - healthTextWidthEn / 2;
      ctx.fillText(attackTextEn, attackXEn, enemyY + 85);
      ctx.fillText(healthTextEn, healthXEn, enemyY + 85);

      returnFrame += deltaTime;
      if (returnFrame <= returnDuration / 1000) {
        requestAnimationFrame(animateBack);
      } else {
        onComplete();
      }
    }
    requestAnimationFrame(animateBack);
  }
}
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
function showDamage(
  playerX,
  playerDamage,
  enemyX,
  enemyDamage,
  playerImg,
  enemyImg,
  playerHealth,
  enemyHealth,
  onComplete
) {
  let alpha = 1.0;
  const fadeDuration = 50;
  const displayDuration = 50;
  const maxFontSize = 2.5;
  const minFontSize = 0.625;
  const commonY = 210;
  const playerDamageOffsetX = -25;
  const playerDamageOffsetY = -1;
  const enemyDamageOffsetX = 35;
  const enemyDamageOffsetY = -4;
  let currentFrame = 0;
  const totalFrames = 30;
  const fistImg = new Image();
  fistImg.src = "../assets/fist.png";

  const heartImg = new Image();
  heartImg.src = "../assets/heart.png";
  function drawExpandingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam();
    ctx.drawImage(playerImg, playerX, commonY, 80, 80);
    ctx.drawImage(fistImg, playerX, commonY + 60, 40, 40);
    ctx.drawImage(heartImg, playerX + 40, commonY + 60, 40, 40);
    ctx.drawImage(enemyImg, enemyX, commonY, 80, 80);
    ctx.drawImage(fistImg, enemyX, commonY + 60, 40, 40);
    ctx.drawImage(heartImg, enemyX + 40, commonY + 60, 40, 40);
    ctx.fillStyle = "white";
    ctx.font = "1rem Arial";
    let attackText = `${playerDamage}`;
    let attackTextWidth = ctx.measureText(attackText).width;
    let attackX = playerX + 20 - attackTextWidth / 2;
    let healthText = `${playerHealth}`;
    let healthTextWidth = ctx.measureText(healthText).width;
    let healthX = playerX + 60 - healthTextWidth / 2;
    ctx.fillText(attackText, attackX, commonY + 85);
    ctx.fillText(healthText, healthX, commonY + 85);
    ctx.fillStyle = "white";
    ctx.font = "1rem Arial";
    let attackTextEn = `${enemyDamage}`;
    let attackTextWidthEn = ctx.measureText(attackTextEn).width;
    let attackXEn = enemyX + 20 - attackTextWidthEn / 2;
    let healthTextEn = `${enemyHealth}`;
    let healthTextWidthEn = ctx.measureText(healthTextEn).width;
    let healthXEn = enemyX + 60 - healthTextWidthEn / 2;
    ctx.fillText(attackTextEn, attackXEn, commonY + 85);
    ctx.fillText(healthTextEn, healthXEn, commonY + 85);

    ctx.save();
    const progress = currentFrame / totalFrames;
    const fontSize = minFontSize + progress * (maxFontSize - minFontSize);
    ctx.font = `${fontSize}rem Arial`;
    ctx.fillStyle = "red";
    ctx.globalAlpha = alpha;
    ctx.fillText(
      `${enemyDamage}`,
      playerX + playerDamageOffsetX,
      commonY + playerDamageOffsetY
    );
    ctx.fillText(
      `${playerDamage}`,
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
    ctx.drawImage(playerImg, playerX, commonY, 80, 80);
    ctx.drawImage(fistImg, playerX, commonY + 60, 40, 40);
    ctx.drawImage(heartImg, playerX + 40, commonY + 60, 40, 40);
    ctx.drawImage(enemyImg, enemyX, commonY, 80, 80);
    ctx.drawImage(fistImg, enemyX, commonY + 60, 40, 40);
    ctx.drawImage(heartImg, enemyX + 40, commonY + 60, 40, 40);
    let attackText = `${playerDamage}`;
    let attackTextWidth = ctx.measureText(attackText).width;
    let attackX = playerX + 20 - attackTextWidth / 2;
    let healthText = `${playerHealth}`;
    let healthTextWidth = ctx.measureText(healthText).width;
    let healthX = playerX + 60 - healthTextWidth / 2;
    ctx.fillText(attackText, attackX, commonY + 85);
    ctx.fillText(healthText, healthX, commonY + 85);
    let attackTextEn = `${enemyDamage}`;
    let attackTextWidthEn = ctx.measureText(attackTextEn).width;
    let attackXEn = enemyX + 20 - attackTextWidthEn / 2;
    let healthTextEn = `${enemyHealth}`;
    let healthTextWidthEn = ctx.measureText(healthTextEn).width;
    let healthXEn = enemyX + 60 - healthTextWidthEn / 2;
    ctx.fillText(attackTextEn, attackXEn, commonY + 85);
    ctx.fillText(healthTextEn, healthXEn, commonY + 85);
    ctx.save();
    const progress = currentFrame / totalFrames;
    const fontSize = maxFontSize - progress * (maxFontSize - minFontSize);
    alpha = 1 - progress;
    ctx.font = `${fontSize}rem Arial`;
    ctx.fillStyle = "red";
    ctx.globalAlpha = alpha;
    ctx.fillText(
      `${enemyDamage}`,
      playerX + playerDamageOffsetX,
      commonY + playerDamageOffsetY
    );
    ctx.fillText(
      `${playerDamage}`,
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
  const commonY = 210;
  const teamOffsetX = 100;
  const enemyOffsetX = canvas.width - 550;
  const imgSize = 80;
  const iconSize = 40;
  const fistImg = new Image();
  fistImg.src = "../assets/fist.png";
  const heartImg = new Image();
  heartImg.src = "../assets/heart.png";
  battleLineup.forEach((animal, index) => {
    if (animal && index !== 0) {
      const xPos = teamOffsetX + (maxSlots - 1 - index) * 100;
      ctx.drawImage(
        getAnimalImage(animal.img),
        xPos,
        commonY,
        imgSize,
        imgSize
      );
      ctx.drawImage(fistImg, xPos, commonY + 60, iconSize, iconSize);
      ctx.drawImage(heartImg, xPos + 40, commonY + 60, iconSize, iconSize);
      ctx.fillStyle = "white";
      ctx.font = "1rem Arial";
      let attackText = `${animal.attack}`;
      let attackTextWidth = ctx.measureText(attackText).width;
      let attackX = xPos + 20 - attackTextWidth / 2;
      let healthText = `${animal.health}`;
      let healthTextWidth = ctx.measureText(healthText).width;
      let healthX = xPos + 60 - healthTextWidth / 2;
      ctx.fillText(attackText, attackX, commonY + 85);
      ctx.fillText(healthText, healthX, commonY + 85);
    }
  });
  enemyLineup.forEach((animal, index) => {
    if (animal && index !== 0) {
      const xPos = enemyOffsetX + index * 100;
      ctx.drawImage(
        getAnimalImage(animal.img),
        xPos,
        commonY,
        imgSize,
        imgSize
      );
      ctx.drawImage(fistImg, xPos, commonY + 60, iconSize, iconSize);
      ctx.drawImage(heartImg, xPos + 40, commonY + 60, iconSize, iconSize);
      ctx.fillStyle = "white";
      ctx.font = "1rem Arial";
      let attackText = `${animal.attack}`;
      let attackTextWidth = ctx.measureText(attackText).width;
      let attackX = xPos + 20 - attackTextWidth / 2;
      let healthText = `${animal.health}`;
      let healthTextWidth = ctx.measureText(healthText).width;
      let healthX = xPos + 60 - healthTextWidth / 2;
      ctx.fillText(attackText, attackX, commonY + 85);
      ctx.fillText(healthText, healthX, commonY + 85);
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
  const totalFrames = 10; // Further reduced total frames to make the animation faster
  let startX, startY;
  if (teamType === "player") {
    startX = 100 + (maxSlots - 1 - index) * 100;
    startY = 210;
  } else {
    startX = canvas.width - 550 + index * 100;
    startY = 210;
  }
  const endX = teamType === "player" ? -100 : canvas.width + 100;
  const controlPointX = (startX + endX) / 2;
  const controlPointY = startY - 400;
  let lastFrameTime = performance.now();

  function animate(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;

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
    ctx.clearRect(previousX - 30, previousY - 30, 120, 160);
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

    currentFrame += deltaTime * totalFrames * 2; // Increase the increment to make it faster
    if (currentFrame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  }
  requestAnimationFrame(animate);
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
async function simulateBattle() {
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
        location.reload();
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
const trashBin = document.getElementById("trashBin");
function showTrashBin() {
  trashBin.classList.remove("hidden");
}
function hideTrashBin() {
  trashBin.classList.add("hidden");
}
function handleTrashDrop(event) {
  event.preventDefault();
  const slotIndex = event.dataTransfer.getData("text/plain");
  battleLineup[slotIndex] = null; // Remove the animal from the lineup
  renderBattleSlots();
  saveBattleLineup();
}
trashBin.addEventListener("dragover", (event) => {
  event.preventDefault();
});
trashBin.addEventListener("drop", handleTrashDrop);
