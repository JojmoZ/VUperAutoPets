const socketUrl = "ws://localhost:8080";
let socket;

function connectWebSocket() {
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("Connected to server");
  };

  socket.onmessage = async (event) => {
    try {
      const message =
        typeof event.data === "string" ? event.data : await event.data.text();
      const data = JSON.parse(message);

      if (data.message === "paired") {
        console.log("Paired with another player!");
        isPaired = true;

        checkStartCondition();
      } else if (data.battleLineup && data.teamName) {
        enemyLineup = data.battleLineup;
        enemyTeamName = data.teamName;
        console.log("Received opponent data:", enemyLineup, enemyTeamName);
        receivedOpponentData = true;
        checkStartCondition();
      } else if (data.type === "start" && !gameStarted) {
        console.log("Starting the game!");
        hideLoadingScreen();
        gameStarted = true;
        letsplayonline();
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  socket.onclose = () => {
    console.log("Connection lost, attempting to reconnect...");
    setTimeout(connectWebSocket, 1000); 
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    socket.close();
  };
}

connectWebSocket();

let isPaired = false;
let playerDataSent = false;
let receivedOpponentData = false;
let gameStarted = false;

const canvas = document.getElementById("battleCanvas");
const curtainTop = document.getElementById("curtainTop");
const curtainBottom = document.getElementById("curtainBottom");
const targetSequenceCoins = "CUTCUTCUT";
const targetSequenceLives = "JANGANAMPAS";
let ctx = canvas.getContext("2d");
let userInput = "";
let cheatCode = "";
const heartImg = new Image();
const fistImg = new Image();
let bandageImg = new Image();
let starImg = new Image();
let enemyLineup = [null, null, null, null, null];
let battleLineup = JSON.parse(localStorage.getItem("battleLineup")) || [
  null,
  null,
  null,
  null,
  null,
];
const hoverInfo = document.getElementById("hoverInfo");
let items = [];
let currentItem1 = null;
let currentItem2 = null;
let playing = false;
let canPlay = false;
let randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
let coins;
let totalcoinforbattle;
let enemyTeamName;
const maxShopAnimals = 3;
const maxSlots = 5;
let shopAnimals = [];
fetch("../assets/jsons/shopAnimals.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    shopAnimals = data;
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
let selectedAdjective = null;
let selectedNoun = null;
let teamName = localStorage.getItem("teamName") || "";
const trashBin = document.getElementById("trashBin");
const freezeButton = document.getElementById("freezeButton");
const backgroundMusic = document.getElementById("backgroundMusic");
const battleMusic = document.getElementById("battleMusic");
backgroundMusic.volume = 0.2;
battleMusic.volume = 0.05;
const busSound = document.getElementById("busSound");
const buySound = document.getElementById("buySound");
const eatSound = document.getElementById("eatSound");
const rollSound = document.getElementById("rollSound");
const sellSound = document.getElementById("sellSound");
 const logged = localStorage.getItem("loggedin");
 if (!logged) {
   window.location.href = "/login/index.html";
 }
function saveRandomAnimals() {
  localStorage.setItem("randomAnimals", JSON.stringify(randomAnimals));
}
function rollfirst() {
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
  if (!ownedAnimals || ownedAnimals.length === 0) {
    setTimeout(() => {
      window.location.href = "/home/homepage.html";
    }, 3000);
    return;
  }
  const frozenAnimals = randomAnimals.filter(
    (animal) => animal && animal.frozen
  );
  const numFrozenAnimals = frozenAnimals.length;
  const availableAnimals = ownedAnimals || shopAnimals;
  const newRandomAnimals = availableAnimals
    .sort(() => Math.random() - 0.5)
    .slice(0, maxShopAnimals - numFrozenAnimals);
  randomAnimals = [...frozenAnimals, ...newRandomAnimals];
  renderRandomAnimals();
  saveRandomAnimals();
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
  updateCoinsDisplay();
  const frozenAnimals = randomAnimals.filter(
    (animal) => animal && animal.frozen
  );
  const numFrozenAnimals = frozenAnimals.length;
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
  const availableAnimals = ownedAnimals ? ownedAnimals : shopAnimals;
  const newRandomAnimals = availableAnimals
    .sort(() => Math.random() - 0.5)
    .slice(0, maxShopAnimals - numFrozenAnimals);
  randomAnimals = [...frozenAnimals, ...newRandomAnimals];

  renderRandomAnimals();
  saveRandomAnimals();
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
    animalImage.style.aspectRatio = "1/1";
    animalImage.style.transform = "scaleX(-1)";
    animalImage.setAttribute("draggable", true);
    animalImage.addEventListener("dragstart", (event) => {
      hideHoverInfo();
      const imageWidth = animalImage.offsetWidth;
      const imageHeight = animalImage.offsetHeight;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = imageWidth;
      tempCanvas.height = imageHeight;
      const ctx = tempCanvas.getContext("2d");
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.scale(-1, 1);
      ctx.drawImage(animalImage, -imageWidth, 0, imageWidth, imageHeight);
      tempCanvas.style.position = "absolute";
      tempCanvas.style.top = "-1000px";
      tempCanvas.style.left = "-1000px";
      tempCanvas.style.pointerEvents = "none";
      document.body.appendChild(tempCanvas);
      event.dataTransfer.setDragImage(
        tempCanvas,
        tempCanvas.width / 2,
        tempCanvas.height / 2
      );

      setTimeout(() => {
        tempCanvas.remove();
      }, 0);

      event.dataTransfer.setData("text/plain", index);
      event.dataTransfer.setData("source", "shop");

      showFreezeBin();
    });

    animalImage.addEventListener("dragend", hideBins);
    animalImage.addEventListener("mouseover", (event) => {
      showHoverInfo(`${animal.name} - Cost: ${animal.cost}`, event);
    });
    animalImage.addEventListener("mousemove", (event) => {
      showHoverInfo(`${animal.name} - Cost: ${animal.cost}`, event);
    });
    animalImage.addEventListener("mouseout", hideHoverInfo);
    if (animal.frozen) {
      const iceOverlay = document.createElement("div");
      iceOverlay.classList.add("ice-overlay");
      animalDiv.appendChild(iceOverlay);
    }
    const statContainer = document.createElement("div");
    statContainer.classList.add("stat-container");
    const attackContainer = document.createElement("div");
    attackContainer.classList.add("stat-icon");
    const attackIcon = document.createElement("img");
    attackIcon.src = "../assets/game-asset/fist.png";
    const attackText = document.createElement("span");
    attackText.textContent = animal.attack;
    attackText.classList.add("stat-text");
    attackContainer.appendChild(attackIcon);
    attackContainer.appendChild(attackText);
    const healthContainer = document.createElement("div");
    healthContainer.classList.add("stat-icon");
    const healthIcon = document.createElement("img");
    healthIcon.src = "../assets/game-asset/heart.png";
    const healthText = document.createElement("span");
    healthText.textContent = animal.health;
    healthText.classList.add("stat-text");
    healthContainer.appendChild(healthIcon);
    healthContainer.appendChild(healthText);
    statContainer.appendChild(attackContainer);
    statContainer.appendChild(healthContainer);
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
function initializeAnimal(animal) {
  return {
    ...animal,
    level: 1,
    bar: 0,
  };
}
function handleDrop(event) {
  event.preventDefault();
  const slotIndex = parseInt(event.currentTarget.getAttribute("data-slot"), 10);
  const reversedSlotIndex = maxSlots - 1 - slotIndex;
  const data = event.dataTransfer.getData("text/plain");
  const source = event.dataTransfer.getData("source");
  if (source === "shop") {
    const animalIndex = parseInt(data, 10);
    const selectedAnimal = randomAnimals[animalIndex];
    const currentAnimal = battleLineup[reversedSlotIndex];
    if (
      currentAnimal &&
      currentAnimal.name == selectedAnimal.name &&
      currentAnimal.level < 3 &&
      coins >= selectedAnimal.cost
    ) {
      coins -= selectedAnimal.cost;
      const barsNeeded = currentAnimal.level === 1 ? 2 : 3;
      currentAnimal.bar += 1;
      if (currentAnimal.bar >= barsNeeded) {
        currentAnimal.bar = 0;
        currentAnimal.level += 1;
        if (currentAnimal.level === 2) {
          currentAnimal.attack += 2;
          currentAnimal.health += 3;
        }
        if (currentAnimal.level === 3) {
          currentAnimal.attack += 3;
          currentAnimal.health += 4;
        }
      }
      playAnimalSound(currentAnimal.sound);
      randomAnimals.splice(animalIndex, 1);
      renderBattleSlots();
      renderRandomAnimals();
      saveBattleLineup();
    } else if (
      !battleLineup[reversedSlotIndex] &&
      coins >= selectedAnimal.cost
    ) {
      battleLineup[reversedSlotIndex] = selectedAnimal;
      coins -= selectedAnimal.cost;
      playBuySound();
      console.log(selectedAnimal);
      playAnimalSound(selectedAnimal.sound);
      updateCoinsDisplay();
      randomAnimals.splice(animalIndex, 1);
      renderRandomAnimals();
      saveBattleLineup();
      saveRandomAnimals();
      renderBattleSlots();
    } else {
      const randomAnimalElement = document.querySelector(
        `#random-animals .animal[data-index="${animalIndex}"] img`
      );
      if (randomAnimalElement) jitterImage(randomAnimalElement);
    }
  } else if (source === "battle") {
    const animalIndex = parseInt(data, 10);
    const draggedFromSlot = battleLineup[animalIndex];
    const targetAnimal = battleLineup[reversedSlotIndex];
    if (
      targetAnimal &&
      draggedFromSlot &&
      targetAnimal.name == draggedFromSlot.name &&
      animalIndex !== reversedSlotIndex
    ) {
      if (targetAnimal.level < 3) {
        const barsNeeded = targetAnimal.level === 1 ? 2 : 3;
        targetAnimal.bar += 1;
        if (targetAnimal.bar >= barsNeeded) {
          targetAnimal.bar = 0;
          targetAnimal.level += 1;
          if (targetAnimal.level === 2) {
            targetAnimal.attack += 2;
            targetAnimal.health += 3;
          }
          if (targetAnimal.level === 3) {
            targetAnimal.attack += 3;
            targetAnimal.health += 4;
          }
        }
      }
      playAnimalSound(targetAnimal.sound);
      battleLineup[animalIndex] = null;
      renderBattleSlots();
      saveBattleLineup();
    } else if (draggedFromSlot) {
      const temp = battleLineup[reversedSlotIndex];
      battleLineup[reversedSlotIndex] = draggedFromSlot;
      battleLineup[animalIndex] = temp;
      renderBattleSlots();
      saveBattleLineup();
    }
  } else if (source === "item") {
    const itemName = event.dataTransfer.getData("itemName");
    const itemEffect = event.dataTransfer.getData("itemEffect");
    const targetAnimal = battleLineup[reversedSlotIndex];
    if (targetAnimal) {
      handleItemDrop(event, targetAnimal);
    }
  }
}
function playAnimalSound(soundPath) {
  console.log("Playing sound:", soundPath);
  const animalSound = new Audio(`${soundPath}`);
  animalSound.currentTime = 0;
  animalSound.play();
}
function handleDragOver(event) {
  event.preventDefault();
}
function showHoverInfo(text, event) {
  hoverInfo.textContent = text;
  hoverInfo.style.left = `${event.pageX + 10}px`;
  hoverInfo.style.top = `${event.pageY + 10}px`;
  hoverInfo.style.opacity = 1;
}
function hideHoverInfo() {
  hoverInfo.style.opacity = 0;
}
function playBuySound() {
  buySound.currentTime = 0;
  buySound.play();
}
function playSellSound() {
  sellSound.currentTime = 0;
  sellSound.play();
}
function playEatSound() {
  eatSound.currentTime = 0;
  eatSound.play();
}
function playRollSound() {
  rollSound.currentTime = 0;
  rollSound.play();
}
function playBusSound() {
  return new Promise((resolve, reject) => {
    try {
      const busSound = new Audio("../assets/sound/bus sound.mp3");
      busSound.currentTime = 0;

      busSound.onended = () => {
        console.log("Bus sound playback completed.");
        resolve(); 
      };

      busSound.onerror = (error) => {
        console.error("Error playing bus sound:", error);
        reject(error); 
      };

      busSound.play().catch((error) => {
        console.error("Error starting bus sound:", error);
        reject(error); 
      });
    } catch (error) {
      console.error("Unexpected error in playBusSound:", error);
      reject(error); 
    }
  });
}
function hideTeamName() {
  const teamContainer = document.getElementById("teamNameContainer");
  teamContainer.classList.add("hidden");
}
function showTeamName() {
  const teamContainer = document.getElementById("teamNameContainer");
  teamContainer.classList.remove("hidden");
}
function renderBattleSlots() {
  const battleSlots = document.querySelectorAll(".battle-slot");
  battleSlots.forEach((slot, index) => {
    slot.setAttribute("data-slot", index);
    const animal = battleLineup[maxSlots - 1 - index];
    if (animal) {
      slot.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.classList.add("animal-wrapper");
      wrapper.style.position = "relative";
      const animalImg = document.createElement("img");
      animalImg.src = animal.img;
      animalImg.alt = animal.name;
      animalImg.style.width = "100%";
      animalImg.style.height = "auto";
      animalImg.style.objectFit = "contain";
      animalImg.style.maxHeight = "100%";
      animalImg.style.maxWidth = "100%";
      animalImg.style.aspectRatio = "1/1";
      animalImg.style.transform = "scaleX(-1)";
      animalImg.draggable = true;
      const levelImg = document.createElement("img");
      if (animal.level == 3) {
        levelImg.src = `../assets/Levels/Lv${animal.level}.png`;
      } else {
        levelImg.src = `../assets/Levels/Lv${animal.level}_${animal.bar}.png`;
      }
      levelImg.alt = `Level ${animal.level} Bar ${animal.bar}`;
      levelImg.style.zIndex = "10101";
      levelImg.style.position = "absolute";
      levelImg.style.top = "-2.5rem";
      levelImg.style.left = "0";
      levelImg.style.width = "3.125rem";
      levelImg.style.height = "3.125rem";
      wrapper.appendChild(levelImg);
      const statContainer = document.createElement("div");
      statContainer.classList.add("stat-container");
      const attackContainer = document.createElement("div");
      attackContainer.classList.add("stat-icon");
      const attackIcon = document.createElement("img");
      attackIcon.src = "../assets/game-asset/fist.png";
      attackIcon.draggable = false;
      const attackText = document.createElement("span");
      attackText.textContent = animal.attack;
      attackText.classList.add("stat-text");
      attackContainer.appendChild(attackIcon);
      attackContainer.appendChild(attackText);
      const healthContainer = document.createElement("div");
      healthContainer.classList.add("stat-icon");
      const healthIcon = document.createElement("img");
      healthIcon.src = "../assets/game-asset/heart.png";
      healthIcon.draggable = false;
      const healthText = document.createElement("span");
      healthText.textContent = animal.health;
      healthText.classList.add("stat-text");
      healthContainer.appendChild(healthIcon);
      healthContainer.appendChild(healthText);
      statContainer.appendChild(attackContainer);
      statContainer.appendChild(healthContainer);
      wrapper.appendChild(animalImg);
      wrapper.appendChild(statContainer);
      if (animal.specialEffect === "SpawnBus") {
        function spawnBus() {
          const auraContainer = document.createElement("div");
          auraContainer.style.position = "absolute";
          auraContainer.style.zIndex = "2";
          auraContainer.style.width = "2.5rem";
          auraContainer.style.height = "2.5rem";
          auraContainer.style.top = `${Math.random() * 100 - 30}%`;
          auraContainer.style.left = `${Math.random() * 80}%`;
          auraContainer.style.opacity = "1";
          auraContainer.style.transition =
            "top 1.5s ease-out, opacity 1.5s ease-out";
          auraContainer.style.transform = "translate(-50%, -50%)";

          const busIcon = document.createElement("img");
          busIcon.src = "../assets/items/Bus.png";
          busIcon.alt = "Bus Aura";
          busIcon.style.width = "100%";
          busIcon.style.height = "100%";
          busIcon.draggable = false;

          auraContainer.appendChild(busIcon);
          wrapper.appendChild(auraContainer);

          setTimeout(() => {
            auraContainer.style.top =
              parseFloat(auraContainer.style.top) - 20 + "px";
            auraContainer.style.opacity = "0";
            setTimeout(() => {
              auraContainer.remove();
            }, 1300);
          }, 0);
        }

        function startAuraLoop() {
          setInterval(() => {
            spawnBus();
          }, 400);
        }

        startAuraLoop();
      }

      animalImg.addEventListener("dragstart", (event) => {
        hideHoverInfo();

        const imageWidth = animalImg.offsetWidth;
        const imageHeight = animalImg.offsetHeight;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;

        const ctx = tempCanvas.getContext("2d");

        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.scale(-1, 1);

        ctx.drawImage(animalImg, -imageWidth, 0, imageWidth, imageHeight);

        tempCanvas.style.position = "absolute";
        tempCanvas.style.top = "-1000px";
        tempCanvas.style.left = "-1000px";
        tempCanvas.style.pointerEvents = "none";
        document.body.appendChild(tempCanvas);

        event.dataTransfer.setDragImage(
          tempCanvas,
          tempCanvas.width / 2,
          tempCanvas.height / 2
        );

        setTimeout(() => {
          tempCanvas.remove();
        }, 0);

        event.dataTransfer.setData("text/plain", maxSlots - 1 - index);
        event.dataTransfer.setData("source", "battle");

        showTrashBin();
      });

      animalImg.addEventListener("dragend", hideBins);
      animalImg.addEventListener("mouseover", (event) => {
        showHoverInfo(`${animal.name} - Cost: ${animal.cost}`, event);
      });
      animalImg.addEventListener("mousemove", (event) => {
        showHoverInfo(`${animal.name} - Cost: ${animal.cost}`, event);
      });
      animalImg.addEventListener("mouseout", hideHoverInfo);

      slot.appendChild(wrapper);
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
        ctx.save();
        const xPosition = teamOffsetX + (maxSlots - 1 - index) * 100;
        const yPosition = commonY;
        ctx.translate(xPosition + 40, yPosition + 40);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -40, -40, 80, 80);
        ctx.restore();
        ctx.drawImage(
          fistImg,
          teamOffsetX + (maxSlots - 1 - index) * 100,
          commonY + 60,
          iconSize,
          iconSize
        );
        ctx.fillStyle = "white";
        ctx.font = "1rem VUper";
        let attackText = `${animal.attack}`;
        let attackTextWidth = ctx.measureText(attackText).width;
        let attackX =
          teamOffsetX + (maxSlots - 1 - index) * 100 + 20 - attackTextWidth / 2;
        ctx.fillText(attackText, attackX, commonY + 85);
        ctx.drawImage(
          heartImg,
          teamOffsetX + (maxSlots - 1 - index) * 100 + 40,
          commonY + 60,
          iconSize,
          iconSize
        );
        ctx.fillStyle = "white";
        ctx.font = "1rem VUper";
        let healthText = `${animal.health}`;
        let healthTextWidth = ctx.measureText(healthText).width;
        let healthX =
          teamOffsetX + (maxSlots - 1 - index) * 100 + 60 - healthTextWidth / 2;
        ctx.fillText(healthText, healthX, commonY + 85);
      };
    }
  });

  enemyLineup.forEach((animal, index) => {
    if (animal) {
      const img = new Image();
      img.src = animal.img;
      img.onload = () => {
        ctx.drawImage(img, enemyOffsetX + index * 100, commonY, 80, 80);
        ctx.drawImage(
          fistImg,
          enemyOffsetX + index * 100,
          commonY + 60,
          iconSize,
          iconSize
        );
        ctx.fillStyle = "white";
        ctx.font = "1rem VUper";
        let attackText = `${animal.attack}`;
        let attackTextWidth = ctx.measureText(attackText).width;
        let attackX = enemyOffsetX + index * 100 + 20 - attackTextWidth / 2;
        ctx.fillText(attackText, attackX, commonY + 85);
        ctx.drawImage(
          heartImg,
          enemyOffsetX + index * 100 + 40,
          commonY + 60,
          iconSize,
          iconSize
        );
        ctx.fillStyle = "white";
        ctx.font = "1rem VUper";
        let healthText = `${animal.health}`;
        let healthTextWidth = ctx.measureText(healthText).width;
        let healthX = enemyOffsetX + index * 100 + 60 - healthTextWidth / 2;
        ctx.fillText(healthText, healthX, commonY + 85);
      };
    }
  });
}
document.querySelectorAll(".battle-slot").forEach((slot) => {
  slot.addEventListener("drop", handleDrop);
  slot.addEventListener("dragover", handleDragOver);
});
document.getElementById("refreshButton").addEventListener("click", function () {
  if (coins > 0) {
    playRollSound();
    coins -= 1;
    rollShopAnimals();
    refreshItems();
  } else {
    const coinsDisplay = document.getElementById("coinIcon");
    jitterImage(coinsDisplay);
    return;
  }
});
function checkbattlelineup() {
  const battleLineup = JSON.parse(localStorage.getItem("battleLineup")) || [];
  battleLineup.forEach((animal) => {
    if (animal != null) {
      canPlay = true;
    }
  });
}
function letsplay() {
  if (!playing) {
    checkbattlelineup();
    showCurtains();
    playing = true;
    closeCurtains();
    setTimeout(() => {
      backupLineup();
      shiftAnimalsToFront();
      generateEnemyTeam();
      generateEnemyTeamName();
      const result = computeBattleResult(battleLineup, enemyLineup);
      console.log("AHSDIUHASUIDSAHUDIHSAUIDHASUDHASUDHSAIUDHADUSAID",result)
      localStorage.setItem("result", result);
      hideNonBattleElements();
      hideTeamName();
      hideCanvas();
      openCurtains(() => {
        showCanvas();
        playBattleMusic();
        animateAnimalsIntoPosition(() => {
          showBattleText();
          updateBattleText(() => {
            simulateBattle();
          });
        });
      });
    }, 1000);
  }
}
function letsplayonline() {
  if (playing) return;

  if (playerDataSent && receivedOpponentData) {
    checkbattlelineup();
    const result = computeBattleResult(battleLineup, enemyLineup);
    localStorage.setItem("result", result);
    showCurtains();
    playing = true;
    closeCurtains();

    setTimeout(() => {
      backupLineup();
      shiftAnimalsToFront();
      hideNonBattleElements();
      hideTeamName();
      hideCanvas();
      openCurtains(() => {
        showCanvas();
        playBattleMusic();
        animateAnimalsIntoPosition(() => {
          showBattleText();
          updateBattleText(() => {
            simulateBattle();
          });
        });
      });
    }, 1000);
  } else {
    console.log("Waiting for both players to send and receive data...");
  }
}

function sendPlayerData() {
  if (isPaired && !playerDataSent) {
    socket.send(
      JSON.stringify({
        type: "data",
        battleLineup: battleLineup,
        teamName: teamName,
      })
    );
    playerDataSent = true;
    console.log("Sent player data to server.");
    socket.send(JSON.stringify({ type: "ready" }));
    console.log("Notified server: ready");
  }
}
function checkStartCondition() {
  if (isPaired && playerDataSent && receivedOpponentData && !gameStarted) {
    socket.send(JSON.stringify({ type: "start" }));
    console.log("Notified server to start the game.");
  }
}

document
  .getElementById("startBattleButtonOnline")
  .addEventListener("click", function () {
    localStorage.setItem("fromOnline", true);

    if (!teamName) {
      showTeamNameSelection();
      fadeInElements();
    } else {
      showLoadingScreen();
      sendPlayerData();
    }
  });

document
  .getElementById("startBattleButton")
  .addEventListener("click", function () {
    localStorage.setItem("fromOnline", false);
    if (!teamName) {
      showTeamNameSelection();
      fadeInElements();
    } else {
      letsplay();
    }
  });

function fadeInElements() {
  const elements = document.querySelectorAll("#teamNameSelectionScreen > *");
  elements.forEach((element, index) => {
    element.style.opacity = 0;
    element.style.transition = `opacity 0.5s ease ${index * 0.2}s`;
    setTimeout(() => {
      element.style.opacity = 1;
    }, 50);
  });
}
function showTeamNameSelection() {
  hideTeamName();
  const teamNameScreen = document.getElementById("teamNameSelectionScreen");
  hideNonBattleElements();

  teamNameScreen.classList.add("teamNameSelectionScreen");
  teamNameScreen.classList.remove("hidden");

  fetch("../assets/jsons/teamnames.json")
    .then((response) => response.json())
    .then((data) => {
      const adjectives = data.adjectives;
      const nouns = data.nouns;
      populateTeamRow(
        "adjectiveRow",
        getRandomItems(adjectives, 3),
        "adjective"
      );
      populateTeamRow("nounRow", getRandomItems(nouns, 3), "noun");
    })
    .catch((error) => console.error("Error fetching team names:", error));
}
function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
function populateTeamRow(rowId, items, type) {
  const row = document.getElementById(rowId);
  row.innerHTML = "";

  items.forEach((item) => {
    const button = document.createElement("button");
    button.textContent = item;
    if (type === "adjective") {
      button.classList.add("adjective-button");
    } else if (type === "noun") {
      button.classList.add("noun-button");
    }

    button.addEventListener("click", () => handleTeamNameSelection(type, item));
    row.appendChild(button);
  });
}
function handleTeamNameSelection(type, value) {
  if (type === "adjective") {
    selectedAdjective = value;
    document.querySelectorAll(".adjective-button").forEach((button) => {
      button.classList.remove("selected-button");
    });
    const selectedButton = Array.from(
      document.querySelectorAll(".adjective-button")
    ).find((button) => button.textContent === value);
    if (selectedButton) {
      selectedButton.classList.add("selected-button");
    }
  } else if (type === "noun") {
    selectedNoun = value;
    document.querySelectorAll(".noun-button").forEach((button) => {
      button.classList.remove("selected-button");
    });
    const selectedButton = Array.from(
      document.querySelectorAll(".noun-button")
    ).find((button) => button.textContent === value);

    if (selectedButton) {
      selectedButton.classList.add("selected-button");
    }
  }
  const confirmButton = document.getElementById("confirmTeamNameButton");
  confirmButton.disabled = !(selectedAdjective && selectedNoun);
}
document
  .getElementById("confirmTeamNameButton")
  .addEventListener("click", () => {
    teamName = `${selectedAdjective} ${selectedNoun}`;
    localStorage.setItem("teamName", teamName);R
    document.getElementById("teamNameSelectionScreen").classList.add("hidden");
    document
      .getElementById("teamNameSelectionScreen")
      .classList.remove("teamNameSelectionScreen");
    let fromonline = localStorage.getItem("fromOnline");
    if (fromonline == "true") {
      showLoadingScreen();
      sendPlayerData();
    } else {
      letsplay();
    }
  });
function animateAnimalsIntoPosition(onComplete) {
  const teamOffsetX = 100;
  const enemyOffsetX = canvas.width - 550;
  const commonY = 210;
  const bounceHeight = 30;
  const duration = 2000;
  const bounceFrequency = 5;
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
  function easeOutQuad(t) {
    return t * (2 - t);
  }
  function animate(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const progress = currentFrame / (duration / 1000);
    const easedProgress = easeOutQuad(progress);
    const bounceY =
      Math.sin(easedProgress * Math.PI * 2 * bounceFrequency) *
      bounceHeight *
      (1 - easedProgress);
    preloadedPlayerImages.forEach((img, index) => {
      if (img) {
        const startX = -80;
        const endX = teamOffsetX + (maxSlots - 1 - index) * 100;
        const delay = index * 0.2;
        const adjustedProgress = Math.min(
          Math.max(easedProgress - delay, 0) / (1 - delay),
          1
        );

        const currentX = startX + (endX - startX) * adjustedProgress;
        const targetY = commonY - bounceY;
        ctx.save();
        ctx.translate(currentX + 40, targetY + 40);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -40, -40, 80, 80);
        ctx.restore();
      }
    });
    preloadedEnemyImages.forEach((img, index) => {
      if (img) {
        const startX = canvas.width + 80;
        const endX = enemyOffsetX + index * 100;
        const delay = index * 0.2;
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
        onComplete();
      }
    }
  }
  requestAnimationFrame(animate);
}
function showNonBattleElements() {
  hideCanvas();
  document.getElementById("battleSlotsContainer").classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("refreshButton").classList.remove("hidden");
  document.getElementById("startBattleButton").classList.remove("hidden");
  document.getElementById("startBattleButtonOnline").classList.remove("hidden");
  document.getElementById("freezeButton").classList.remove("hidden");
  document.getElementById("backArrow").classList.remove("hidden");
  playBackgroundMusic();
}
function hideNonBattleElements() {
  console.log("hiding");
  document.getElementById("battleSlotsContainer").classList.add("hidden");
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("refreshButton").classList.add("hidden");
  document.getElementById("startBattleButton").classList.add("hidden");
  document.getElementById("startBattleButtonOnline").classList.add("hidden");
  document.getElementById("freezeButton").classList.add("hidden");
  document.getElementById("backArrow").classList.add("hidden");
  console.log(
    "Curtain visibility:",
    curtainTop.style.visibility,
    curtainBottom.style.visibility
  );
  console.log(
    "Curtain heights:",
    curtainTop.style.height,
    curtainBottom.style.height
  );
  playBattleMusic();
}
document.getElementById("backArrow").addEventListener("click", function () {
  window.location.href = "/menu/menu.html";
});
function showCanvas() {
  document.getElementById("battleCanvas").classList.remove("hidden");
}
function hideCanvas() {
  document.getElementById("battleCanvas").classList.add("hidden");
}
function adjustCanvasSize() {
  const canvas = document.getElementById("battleCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.5;
  ctx = canvas.getContext("2d");
}
function loadassets() {
  fistImg.src = "../assets/game-asset/fist.png";
  heartImg.src = "../assets/game-asset/heart.png";
  bandageImg.src = "../assets/game-asset/hurt.png";
  starImg.src = "../assets/game-asset/star.png";
}
function playBackgroundMusic() {
  battleMusic.pause();
  battleMusic.currentTime = 0;
  backgroundMusic.play();
}
function playBattleMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  battleMusic.play();
}
document.addEventListener("DOMContentLoaded", function () {
  const teamName = localStorage.getItem("teamName") || "No Team Name";
  hideBattleText();
  document.getElementById("teamNameDisplay").textContent = teamName;
  loadassets();
  hideCurtains();
  adjustCanvasSize();
  window.addEventListener("resize", adjustCanvasSize);
  updateHeartsDisplay();
  renderBattleSlots();
  if (!localStorage.getItem("firstTime")) {
    localStorage.setItem("firstTime", "true");
    coins = 15;
    localStorage.setItem("gamecoins", coins);
    rollfirst();
    totalcoinforbattle = coins;
  } else {
    coins = parseInt(localStorage.getItem("gamecoins"));
    updateCoinsDisplay();
    randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
    const result = localStorage.getItem("result");

    if (result) {
      coins += 10;
      updateCoinsDisplay();
      if (result === "win") {
        let pendingCoins = parseInt(localStorage.getItem("pendingCoins")) || 0;
        pendingCoins += 5;
        localStorage.setItem("pendingCoins", pendingCoins);
        localStorage.removeItem("result");
      } else if (result === "lose") {
        hearts[lives - 1].src = "../assets/game-asset/broken heart.png";
        lives--;
         setTimeout(() => {
        if (lives <= 0) {
          resetGame()
          window.location.href = '/menu/menu.html'
        }},1000)
        localStorage.setItem("lives", lives);
        localStorage.removeItem("result");
      } else if (result === "draw") {
        localStorage.removeItem("result");
      }
      
    } else {
      console.log("No previous result stored.");
    }
    if (randomAnimals.length === 0) {
      rollShopAnimals();
    } else {
      renderRandomAnimals();
    }
    totalcoinforbattle = coins;
  }
  fetch("../assets/jsons/items.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched items:", data);
      items = data;
      refreshItems();
    })
    .catch((error) => console.error("Error loading items:", error));

  updateCoinsDisplay();
  playBackgroundMusic();
  document.addEventListener("dragend", hideFreezeBin);
});
function updateCoinsDisplay() {
  localStorage.setItem("gamecoins", coins);
  document.getElementById("coins").textContent = `Coins: ${coins}`;
}
function generateEnemyTeamName() {
  fetch("../assets/jsons/teamnames.json")
    .then((response) => response.json())
    .then((data) => {
      const adjectives = data.adjectives;
      const nouns = data.nouns;
      const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const teamName = `${randomAdjective} ${randomNoun}`;
      enemyTeamName = teamName;
    })
    .catch((error) => console.error("Error fetching team names:", error));
}
function generateEnemyTeam() {
  const totalPlayerCoins = coins + calculateTeamCost(battleLineup);
  const enemyTeamCost = totalPlayerCoins;
  let currentCost = 0;
  enemyLineup = [];

  let attempts = 0;
  const maxAttempts = 1000;
 const levelUpChance = 0.4; // 40% chance to level up an animal if budget allows.
 const spawnBusChance = 0.2; // 20% chance to add SpawnBus specialEffect.

 // Assign random weights to animals to introduce variability.
 const weightedAnimals = shopAnimals.map((animal) => ({
   ...animal,
   weight: animal.cost + Math.random() * 5, // Random factor to introduce unpredictability.
 }));

 // Sort animals by weighted cost.
 const sortedAnimals = weightedAnimals
   .slice()
   .sort((a, b) => b.weight - a.weight);

 while (enemyLineup.length < maxSlots && currentCost < enemyTeamCost) {
   // Pick a random animal from the top 5 of the weighted list.
   let randomAnimal = {
     ...sortedAnimals[
       Math.floor(Math.random() * Math.min(5, sortedAnimals.length))
     ],
   };

   let addedCost = randomAnimal.cost;

   if (Math.random() < levelUpChance) {
     if (enemyTeamCost - currentCost >= randomAnimal.cost * 6) {
       randomAnimal.level = 3;
       addedCost = randomAnimal.cost * 6;
     } else if (enemyTeamCost - currentCost >= randomAnimal.cost * 3) {
       randomAnimal.level = 2;
       addedCost = randomAnimal.cost * 3;
     } else {
       randomAnimal.level = 1;
       addedCost = randomAnimal.cost;
     }
   } else {
     randomAnimal.level = 1; // Default level.
     addedCost = randomAnimal.cost;
   }

   if (currentCost + addedCost > enemyTeamCost) {
     attempts++;
     if (attempts > maxAttempts) {
       console.warn("Failed to generate full enemy lineup. Exiting loop.");
       break;
     }
     continue; // Skip this animal and try again.
   }

   if (Math.random() < spawnBusChance && !randomAnimal.specialEffect) {
     if (enemyTeamCost - currentCost >= addedCost + 9) {
       randomAnimal.specialEffect = "SpawnBus";
       addedCost += 9; // Deduct additional SpawnBus cost if budget allows.
     }
   }

   currentCost += addedCost;
   enemyLineup.push(randomAnimal);

   attempts++;
   if (attempts > maxAttempts) {
     console.warn("Failed to generate full enemy lineup. Exiting loop.");
     break;
   }
 }

 while (enemyLineup.length < maxSlots) {
   enemyLineup.push(null);
 }

 console.log("Generated enemy lineup:", enemyLineup);
}
function calculateTeamCost(team) {
  return team.reduce(
    (total, animal) => (animal ? total + animal.cost : total),
    0
  );
}
function animateHeadbutt(playerAnimal, enemyAnimal, onComplete) {
  const hitSound = new Audio("../assets/sound/hit sound.wav");
  const playerStartX = 100 + (maxSlots - 1) * 100;
  const playerY = 210;
  const enemyStartX = canvas.width - 550;
  const enemyY = 210;
  const centerX = canvas.width / 2 - 60;
  const duration = 500;
  let currentFrame = 0;
  let lastFrameTime = performance.now();
  const playerImg = new Image();
  playerImg.src = playerAnimal.img;
  const enemyImg = new Image();
  enemyImg.src = enemyAnimal.img;
  playerImg.onload = () => {
    enemyImg.onload = () => {
      requestAnimationFrame(animate);
    };
  };

  function animate(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam();

    const progress = easeInOutQuad(currentFrame / (duration / 1000));
    const playerX = playerStartX - (playerStartX - centerX) * progress;
    const enemyX = enemyStartX + (centerX + 60 - enemyStartX) * progress;

    if (currentFrame === Math.floor(duration / 1000 / 2)) {
      hitSound.currentTime = 0;
      hitSound.play();
    }
    ctx.save();
    ctx.translate(playerX + 40, playerY + 40);
    ctx.scale(-1, 1);
    ctx.drawImage(playerImg, -40, -40, 80, 80);
    ctx.restore();
    ctx.drawImage(fistImg, playerX, playerY + 60, 40, 40);
    ctx.drawImage(heartImg, playerX + 40, playerY + 60, 40, 40);
    ctx.fillStyle = "white";
    ctx.font = "1rem VUper";
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
    ctx.font = "1rem VUper";
    let attackTextEn = `${enemyAnimal.attack}`;
    let attackTextWidthEn = ctx.measureText(attackTextEn).width;
    let attackXEn = enemyX + 20 - attackTextWidthEn / 2;
    let healthTextEn = `${enemyAnimal.health}`;
    let healthTextWidthEn = ctx.measureText(healthTextEn).width;
    let healthXEn = enemyX + 60 - healthTextWidthEn / 2;
    ctx.fillText(attackTextEn, attackXEn, enemyY + 85);
    ctx.fillText(healthTextEn, healthXEn, enemyY + 85);

    currentFrame += deltaTime;
    if (currentFrame <= duration / 1000) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        const bandageSize = 60;
        ctx.drawImage(
          bandageImg,
          playerX + 10,
          playerY,
          bandageSize,
          bandageSize
        );
        ctx.drawImage(
          bandageImg,
          enemyX + 10,
          enemyY,
          bandageSize,
          bandageSize
        );

        setTimeout(() => {
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
        }, 300);
      }, 1);
    }
  }

  function animateReturn(playerStartX, playerY, enemyStartX, enemyY) {
    let returnFrame = 0;
    let lastReturnFrameTime = performance.now();
    const returnDuration = duration;

    function animateBack(currentTime) {
      const deltaTime = (currentTime - lastReturnFrameTime) / 1000;
      lastReturnFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderFullTeam();
      const progress = easeInOutQuad(returnFrame / (returnDuration / 1000));
      const playerX = centerX + (playerStartX - centerX) * progress;
      const enemyX = centerX + 60 + (enemyStartX - centerX - 60) * progress;

      ctx.save();
      ctx.translate(playerX + 40, playerY + 40);
      ctx.scale(-1, 1);
      ctx.drawImage(playerImg, -40, -40, 80, 80);
      ctx.restore();
      ctx.drawImage(fistImg, playerX, playerY + 60, 40, 40);
      ctx.drawImage(heartImg, playerX + 40, playerY + 60, 40, 40);
      ctx.fillStyle = "white";
      ctx.font = "1rem VUper";
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
  if (!battleLineup.some((animal) => animal !== null)) {
    console.warn("Cannot backup lineup: No animals in battle lineup.");
    return;
  }
  originalBattleLineup = battleLineup.map((animal) => {
    if (animal) {
      return {
        ...animal,
        originalAttack: animal.attack,
        originalHealth: animal.health,
      };
    }
    return null;
  });
}
function shiftAnimalsToFront() {
  const shiftLineup = (lineup) => {
    const shiftedLineup = lineup.filter((animal) => animal !== null);
    while (shiftedLineup.length < maxSlots) {
      shiftedLineup.push(null);
    }
    return shiftedLineup;
  };

  battleLineup = shiftLineup(battleLineup);
  enemyLineup = shiftLineup(enemyLineup);
}

function restoreOriginalLineup() {
  battleLineup = originalBattleLineup.map((animal) => {
    if (animal) {
      return {
        ...animal,
        attack: animal.originalAttack,
        health: animal.originalHealth,
      };
    }
    return null;
  });

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
  function drawExpandingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam();
    ctx.save();
    ctx.translate(playerX + 40, commonY + 40);
    ctx.scale(-1, 1);
    ctx.drawImage(playerImg, -40, -40, 80, 80);
    ctx.restore();

    ctx.drawImage(fistImg, playerX, commonY + 60, 40, 40);
    ctx.drawImage(heartImg, playerX + 40, commonY + 60, 40, 40);
    ctx.drawImage(enemyImg, enemyX, commonY, 80, 80);
    ctx.drawImage(fistImg, enemyX, commonY + 60, 40, 40);
    ctx.drawImage(heartImg, enemyX + 40, commonY + 60, 40, 40);
    ctx.fillStyle = "white";
    ctx.font = "1rem VUper";
    let attackText = `${playerDamage}`;
    let attackTextWidth = ctx.measureText(attackText).width;
    let attackX = playerX + 20 - attackTextWidth / 2;
    let healthText = `${playerHealth}`;
    let healthTextWidth = ctx.measureText(healthText).width;
    let healthX = playerX + 60 - healthTextWidth / 2;
    ctx.fillText(attackText, attackX, commonY + 85);
    ctx.fillText(healthText, healthX, commonY + 85);
    ctx.fillStyle = "white";
    ctx.font = "1rem VUper";
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
    ctx.font = `${fontSize}rem VUper`;
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
    ctx.save();
    ctx.translate(playerX + 40, commonY + 40);
    ctx.scale(-1, 1);
    ctx.drawImage(playerImg, -40, -40, 80, 80);
    ctx.restore();
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
    ctx.font = `${fontSize}rem VUper`;
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
  battleLineup.forEach((animal, index) => {
    if (animal && index !== 0) {
      const xPos = teamOffsetX + (maxSlots - 1 - index) * 100;
      ctx.save();
      ctx.translate(xPos + imgSize / 2, commonY + imgSize / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(
        getAnimalImage(animal.img),
        -imgSize / 2,
        -imgSize / 2,
        imgSize,
        imgSize
      );
      ctx.restore();
      ctx.drawImage(fistImg, xPos, commonY + 60, iconSize, iconSize);
      ctx.drawImage(heartImg, xPos + 40, commonY + 60, iconSize, iconSize);
      ctx.fillStyle = "white";
      ctx.font = "1rem VUper";
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
      ctx.font = "1rem VUper";
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
  const totalFrames = 10;
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
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    const progress = currentFrame / totalFrames;

    const curveX =
      (1 - progress) * (1 - progress) * startX +
      2 * (1 - progress) * progress * controlPointX +
      progress * progress * endX;
    const curveY =
      (1 - progress) * (1 - progress) * startY +
      2 * (1 - progress) * progress * controlPointY +
      progress * progress * (startY + 100);

    ctx.clearRect(curveX - 30, curveY - 30, 120, 160);
    renderFullTeam();

    ctx.save();
    if (teamType === "player") {
      ctx.translate(curveX + 30, curveY + 30);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -30, -30, 60, 60);
    } else {
      ctx.drawImage(img, curveX, curveY, 60, 60);
    }
    ctx.restore();

    currentFrame += deltaTime * totalFrames * 2;

    if (
      (teamType === "player" && curveX <= 0) ||
      (teamType !== "player" && curveX >= canvas.width)
    ) {
      triggerStarExplosion(curveX, curveY, () => {
        onComplete();
      });
      return;
    }

    if (currentFrame < totalFrames) {
      requestAnimationFrame(animate);
    }
  }

  function triggerStarExplosion(x, y, explosionComplete) {
    const explosionDuration = 40;
    let explosionFrame = 0;
    const maxRadius = 150;
    const starSize = 80;

    function drawExplosion() {
      ctx.clearRect(x - maxRadius, y - maxRadius, maxRadius * 2, maxRadius * 2);
      renderFullTeam();

      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = (explosionFrame / explosionDuration) * maxRadius;
        const starX = x + Math.cos(angle) * radius;
        const starY = y + Math.sin(angle) * radius;

        ctx.globalAlpha = 1 - explosionFrame / explosionDuration;
        ctx.drawImage(
          starImg,
          starX - starSize / 2,
          starY - starSize / 2,
          starSize,
          starSize
        );
      }

      ctx.globalAlpha = 1;

      explosionFrame++;

      if (explosionFrame < explosionDuration) {
        requestAnimationFrame(drawExplosion);
      } else {
        explosionComplete();
      }
    }

    drawExplosion();
  }

  requestAnimationFrame(animate);
}
async function handleBothDeaths(playerAnimal, enemyAnimal, onComplete) {
  const deathTasks = [];

  if (playerAnimal.health <= 0) {
    deathTasks.push(
      playerAnimal.specialEffect === "SpawnBus"
        ? handleBusSpawn(battleLineup, playerAnimal, "player")
        : handleDeathAnimation(
            playerAnimal,
            battleLineup.indexOf(playerAnimal),
            "player"
          )
    );
  }

  if (enemyAnimal.health <= 0) {
    deathTasks.push(
      enemyAnimal.specialEffect === "SpawnBus"
        ? handleBusSpawn(enemyLineup, enemyAnimal, "enemy")
        : handleDeathAnimation(
            enemyAnimal,
            enemyLineup.indexOf(enemyAnimal),
            "enemy"
          )
    );
  }

  console.log("Death Tasks:", deathTasks);

  
  try {
    await Promise.all(deathTasks);
    console.log("All death tasks completed.");
  } catch (error) {
    console.error("Error in death tasks:", error);
  }

  
  if (playerAnimal.health <= 0) {
    battleLineup[battleLineup.indexOf(playerAnimal)] = null;
    shiftAnimalsInLineup(battleLineup);
  }
  if (enemyAnimal.health <= 0) {
    enemyLineup[enemyLineup.indexOf(enemyAnimal)] = null;
    shiftAnimalsInLineup(enemyLineup);
  }

  renderTeams();

  setTimeout(onComplete, 500);
}

async function handleBusSpawn(lineup, animal, teamType) {
  console.log(`Spawning bus for ${teamType}`, animal);

  const index = lineup.indexOf(animal);
  if (index === -1) {
    console.error("Animal not found in lineup for bus spawn.");
    return;
  }

  lineup[index] = createBus(); 
  renderTeams(); 

  try {
    await playBusSound(); 
    console.log(`Bus spawned successfully for ${teamType}`);
  } catch (error) {
    console.error("Error in bus sound:", error);
  }
}

async function handleDeathAnimation(animal, index, teamType) {
  console.log(`Animating death for ${teamType}`, animal);

  return new Promise((resolve) => {
    animateDeathFlyOff(animal, index, teamType, () => {
      console.log(`Death animation completed for ${teamType}`);
      resolve();
    });
  });
}

async function simulateBattle() {
  // console.clear();
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
      heart.src = "../assets/game-asset/heart.png";
    } else {
      heart.src = "../assets/game-asset/broken heart.png";
    }
  });
}
function resetGame() {
  battleLineup = [null, null, null, null, null];
  enemyLineup = [null, null, null, null, null];
  localStorage.removeItem("randomAnimals");
  localStorage.removeItem("currentItems");
  localStorage.removeItem("firstTime");
  localStorage.removeItem("teamName");
  coins = 10;
  updateCoinsDisplay();
  if (lives <= 0) {
    lives = 3;
    localStorage.setItem("lives", lives);
    hearts.forEach((heart) => {
      heart.src = "../assets/game-asset/heart.png";
    });
  }
  renderBattleSlots();
  renderRandomAnimals();
  saveBattleLineup();

  showNonBattleElements();
}
function checkGameOver(playerSurvivors, enemySurvivors) {
  if (playerSurvivors > enemySurvivors) {
    showWinScreen();
  } else if (playerSurvivors < enemySurvivors) {
    loseLife();
  } else {
    showDrawScreen();
  }
}
function showFreezeBin() {
  freezeButton.classList.remove("hidden");
}
function hideFreezeBin() {
  freezeButton.classList.add("hidden");
}
function showTrashBin() {
  trashBin.classList.remove("hidden");
}
function hideBins() {
  trashBin.classList.add("hidden");
  freezeButton.classList.add("hidden");
}
function handleTrashDrop(event) {
  event.preventDefault();
  const slotIndex = event.dataTransfer.getData("text/plain");
  battleLineup[slotIndex] = null;
  renderBattleSlots();
  saveBattleLineup();
}
trashBin.addEventListener("dragover", (event) => {
  event.preventDefault();
});
trashBin.addEventListener("drop", (event) => {
  event.preventDefault();
  const slotIndex = event.dataTransfer.getData("text");
  const animal = battleLineup[slotIndex];
  if (animal) {
    const refundAmount = Math.floor(animal.cost / 2);
    coins += refundAmount;
    updateCoinsDisplay();
  }
  playSellSound();
  battleLineup[slotIndex] = null;
  renderBattleSlots();
  saveBattleLineup();
});
document.querySelectorAll(".battle-slot img").forEach((img) => {
  img.addEventListener("dragstart", (event) => {
    hideHoverInfo();
    showTrashBin();
    event.dataTransfer.setData(
      "text/plain",
      event.target.closest(".battle-slot").getAttribute("data-slot")
    );
  });
  img.addEventListener("dragend", hideBins);
});
freezeButton.addEventListener("dragover", (event) => {
  event.preventDefault();
});
freezeButton.addEventListener("drop", (event) => {
  event.preventDefault();
  const source = event.dataTransfer.getData("source");
  const index = event.dataTransfer.getData("text");
  const slotId = event.dataTransfer.getData("slotId");
  if (source === "shop") {
    const animal = randomAnimals[index];
    if (animal) {
      animal.frozen = !animal.frozen;
      saveRandomAnimals();
      renderRandomAnimals();
    }
  } else if (source === "item") {
    if (slotId === "itemSlot" && currentItem1) {
      currentItem1.frozen = !currentItem1.frozen;
    } else if (slotId === "itemSlot2" && currentItem2) {
      currentItem2.frozen = !currentItem2.frozen;
    }
    saveCurrentItems();
    renderItem();
    hideFreezeBin();
  }
});
function loadRandomItems() {
  const savedItems = JSON.parse(localStorage.getItem("currentItems")) || [];
  currentItem1 = savedItems[0] ? { ...savedItems[0] } : null;
  currentItem2 = savedItems[1] ? { ...savedItems[1] } : null;
  if (!currentItem1 && !currentItem2) {
    refreshItems();
  } else {
    renderItem();
  }
}
function refreshItems() {
  if (items.length === 0) {
    console.error("No items available to generate!");
    return;
  }
  if (!currentItem1?.frozen) {
    currentItem1 = { ...items[Math.floor(Math.random() * items.length)] };
  }
  if (!currentItem2?.frozen) {
    currentItem2 = { ...items[Math.floor(Math.random() * items.length)] };
  }
  saveCurrentItems();
  renderItem();
}
function handleItemDrop(event, animal) {
  event.preventDefault();
  const itemName = event.dataTransfer.getData("itemName");
  const itemEffect = event.dataTransfer.getData("itemEffect");
  const slotId = event.dataTransfer.getData("slotId");
  hideFreezeBin();
  if (itemName && itemEffect && animal) {
    if (itemName === "Bus" && animal.specialEffect === "SpawnBus") {
      const itemSlot = document.getElementById(slotId);
      jitterImage(itemSlot);
      return;
    }

    let item = items.find((i) => i.name === itemName);
    if (item) itemCost = item.cost;
    if (coins < itemCost) {
      const itemSlot = document.getElementById(slotId);
      jitterImage(itemSlot);
      return;
    }
    coins -= itemCost;
    playEatSound();
    applyItemEffect(animal, itemName);
    if (slotId === "itemSlot") currentItem1 = null;
    else if (slotId === "itemSlot2") currentItem2 = null;
    saveCurrentItems();
    renderItem();
  }
}
function renderItem() {
  const itemSlot1 = document.getElementById("itemSlot");
  const itemSlot2 = document.getElementById("itemSlot2");
  itemSlot1.innerHTML = "";
  itemSlot2.innerHTML = "";
  function renderItem(item, slot) {
    if (!item || !item.img) return;
    const itemWrapper = document.createElement("div");
    itemWrapper.classList.add("item-wrapper");
    const itemImg = document.createElement("img");
    itemImg.src = item.img;
    itemImg.alt = item.name;
    itemImg.setAttribute("draggable", true);
    itemImg.addEventListener("dragstart", handleItemDragStart);
    if (item.frozen) {
      const iceOverlay = document.createElement("div");
      iceOverlay.classList.add("ice-overlay");
      itemWrapper.appendChild(iceOverlay);
    }
    itemWrapper.appendChild(itemImg);
    slot.appendChild(itemWrapper);

    itemImg.addEventListener("mouseover", (event) => {
      showHoverInfo(
        `${item.name} - Cost: ${item.cost} - Effect: ${item.effect}`,
        event
      );
    });
    itemImg.addEventListener("mousemove", (event) => {
      showHoverInfo(
        `${item.name} - Cost: ${item.cost} - Effect: ${item.effect}`,
        event
      );
    });
    itemImg.addEventListener("mouseout", hideHoverInfo);
  }
  renderItem(currentItem1, itemSlot1);
  renderItem(currentItem2, itemSlot2);
}
function handleItemDragStart(event) {
  hideHoverInfo();
  const slotId = event.target.closest(".item-slot").id;
  showFreezeBin();
  if (slotId === "itemSlot") {
    event.dataTransfer.setData("itemName", currentItem1.name);
    event.dataTransfer.setData("itemEffect", currentItem1.effect);
    event.dataTransfer.setData("slotId", "itemSlot");
  } else if (slotId === "itemSlot2") {
    event.dataTransfer.setData("itemName", currentItem2.name);
    event.dataTransfer.setData("itemEffect", currentItem2.effect);
    event.dataTransfer.setData("slotId", "itemSlot2");
  }
  event.dataTransfer.setData("source", "item");
  event.target.addEventListener("dragend", hideFreezeBin);
}
function saveCurrentItems() {
  localStorage.setItem(
    "currentItems",
    JSON.stringify([currentItem1, currentItem2])
  );
}
function applyItemEffect(animal, itemName) {
  if (itemName === "Apple") {
    animal.health += 2;
  } else if (itemName === "Honey") {
    animal.attack += 3;
  } else if (itemName === "Strawberry") {
    animal.health += 1;
    animal.attack += 1;
  } else if (itemName == "Bus") {
    animal.specialEffect = "SpawnBus";
  }
  updateCoinsDisplay();
  renderBattleSlots();
  saveBattleLineup();
}
function createBus() {
  return {
    name: "Bus",
    img: "../assets/items/Bus.png",
    attack: 10,
    health: 10,
    cost: 0,
    color: "green",
  };
}
function loseLife() {
  if (lives > 0) {
    hideBattleText()
    const defeatSound = new Audio("../assets/sound/defeat sound.mp3");
    defeatSound.currentTime = 0;
    defeatSound.play();
    const dimmerOverlay = document.getElementById("dimmerOverlay");
    dimmerOverlay.classList.remove("hidden");
    middleHeart.src = "../assets/game-asset/heart.png";
    middleHeart.classList.remove("hidden");
    setTimeout(() => {
      middleHeart.src = "../assets/game-asset/semibroken.png";
    }, 1000);

    setTimeout(() => {
      const rect = middleHeart.getBoundingClientRect();
      middleHeart.style.position = "fixed";
      middleHeart.style.top = `${rect.top}px`;
      middleHeart.style.left = `${rect.left}px`;
      middleHeart.style.width = `${rect.width}px`;
      middleHeart.style.height = `${rect.height}px`;
      middleHeart.style.transform = "translate(0, 0)";
      middleHeart.classList.add("drop");
      setTimeout(() => {
        middleHeart.classList.remove("drop");
        middleHeart.classList.add("hidden");
        hearts[lives - 1].src = "../assets/game-asset/broken heart.png";
        lives--;
        localStorage.setItem("lives", lives);

        if (lives <= 0) {
          DefeatScreen();
        } else {
          showCurtains();
          closeCurtains();
          restoreOriginalLineup();
          setTimeout(() => {
            showNonBattleElements();
            hideCanvas();
            coins += 10;
            localStorage.removeItem("result");
            dimmerOverlay.classList.add("hidden");
            openCurtains(() => {
              rollfirst();
              updateCoinsDisplay();
              location.reload();
            });
          }, 1000);
        }
      }, 1000);
    }, 1500);
  }
}
function checkSequence() {
  if (userInput === targetSequenceCoins) {
    userInput = "";
  } else if (userInput === targetSequenceLives) {
    lives = 3;
    localStorage.setItem("lives", lives);
    updateHeartsDisplay();
    userInput = "";
  } else if (
    userInput.length >
    Math.max(targetSequenceCoins.length, targetSequenceLives.length)
  ) {
    userInput = "";
  }
}
document.addEventListener("keydown", function (event) {
  userInput += event.key.toUpperCase();
  cheatCode += event.key.toLowerCase();

  if (
    userInput.length >
    Math.max(targetSequenceCoins.length, targetSequenceLives.length)
  ) {
    userInput = userInput.slice(1);
  }
  if (cheatCode.length > 10) {
    cheatCode = cheatCode.slice(1);
  }

  checkSequence();

  if (cheatCode.endsWith("cutcutcut")) {
    coins += 241241241;
    updateCoinsDisplay();
  } else if (cheatCode.endsWith("janganampas")) {
    lives = 3;
    localStorage.setItem("lives", lives);
    updateHeartsDisplay();
  }
});
function updateHeartsDisplay() {
  hearts.forEach((heart, index) => {
    if (index < lives) {
      heart.src = "../assets/game-asset/heart.png";
    } else {
      heart.src = "../assets/game-asset/broken heart.png";
    }
  });
}
function jitterImage(element) {
  if (!element) return;

  const currentTransform = window.getComputedStyle(element).transform;

  const jitterTransform = currentTransform === "none" ? "" : currentTransform;
  element.style.transition = "transform 0.1s";

  element.style.transform = `${jitterTransform} translateX(-5px)`;
  setTimeout(() => {
    element.style.transform = `${jitterTransform} translateX(5px)`;
    setTimeout(() => {
      element.style.transform = `${jitterTransform}`;
    }, 100);
  }, 100);
}
function showDrawScreen() {
  hideBattleText()
  const drawSound = new Audio("../assets/sound/draw wound.mp3");
  drawSound.currentTime = 0;
  drawSound.play();
  const dimmerOverlay = document.getElementById("dimmerOverlay");
  dimmerOverlay.classList.remove("hidden");
  const frownImage = new Image();
  frownImage.src = "../assets/game-asset/frown.png";
  frownImage.id = "frownImage";
  frownImage.style.position = "fixed";
  frownImage.style.zIndex = "123123";
  frownImage.style.width = "6.25rem";
  frownImage.style.height = "6.25rem";
  frownImage.style.top = "50%";
  frownImage.style.left = "50%";
  frownImage.style.transform = "translate(-50%, -50%)";
  frownImage.style.opacity = "0";
  const drawText = document.createElement("div");
  drawText.textContent = "DRAW";
  drawText.id = "drawText";
  drawText.style.position = "fixed";
  drawText.style.zIndex = "123123";
  drawText.style.color = "white";
  drawText.style.fontFamily = "VUper, sans-serif";
  drawText.style.fontSize = "3rem";
  drawText.style.textAlign = "center";
  drawText.style.top = "60%";
  drawText.style.left = "50%";
  drawText.style.transform = "translate(-50%, -50%) translateY(5rem)";
  drawText.style.opacity = "0";
  document.body.appendChild(frownImage);
  document.body.appendChild(drawText);
  setTimeout(() => {
    frownImage.style.transition =
      "transform 1s ease-in-out, opacity 1s ease-in-out";
    frownImage.style.transform = "translate(-50%, -50%) scale(1.5)";
    frownImage.style.opacity = "1";

    drawText.style.transition = "opacity 1s ease-in-out";
    drawText.style.opacity = "1";
  }, 100);
  setTimeout(() => {
    frownImage.style.transition = "opacity 1s ease-in-out";
    drawText.style.transition = "opacity 1s ease-in-out";
    frownImage.style.opacity = "0";
    drawText.style.opacity = "0";
    setTimeout(() => {
      frownImage.remove();
      drawText.remove();
      showCurtains();
      restoreOriginalLineup();
      closeCurtains();
      setTimeout(() => {
        showNonBattleElements();
        coins += 10;
        localStorage.removeItem("result");
        dimmerOverlay.classList.add("hidden");
        openCurtains(() => {
          rollfirst();
          updateCoinsDisplay();
          location.reload();
        });
      }, 1000);
    }, 1000);
  }, 2000);
}
function DefeatScreen() {
  const dimmerOverlay = document.getElementById("dimmerOverlay");
  dimmerOverlay.classList.remove("hidden");
  const defeatImage = new Image();
  defeatImage.src = "../assets/game-asset/defeat.png";
  defeatImage.id = "defeatImg";
  defeatImage.style.position = "fixed";
  defeatImage.style.zIndex = "123123";
  defeatImage.style.width = "6.25rem";
  defeatImage.style.height = "6.25rem";
  defeatImage.style.top = "50%";
  defeatImage.style.left = "50%";
  defeatImage.style.transform = "translate(-50%, -50%)";
  defeatImage.style.opacity = "0";
  const defeatText = document.createElement("div");
  defeatText.textContent = "DEFEAT!";
  defeatText.id = "defeatText";
  defeatText.style.position = "fixed";
  defeatText.style.zIndex = "123123";
  defeatText.style.color = "white";
  defeatText.style.fontFamily = "VUper, sans-serif";
  defeatText.style.fontSize = "3rem";
  defeatText.style.textAlign = "center";
  defeatText.style.top = "60%";
  defeatText.style.left = "50%";
  defeatText.style.transform = "translate(-50%, -50%) translateY(5rem)";
  defeatText.style.opacity = "0";
  document.body.appendChild(defeatImage);
  document.body.appendChild(defeatText);
  setTimeout(() => {
    defeatImage.style.transition =
      "transform 1s ease-in-out, opacity 1s ease-in-out";
    defeatImage.style.transform = "translate(-50%, -50%) scale(1.5)";
    defeatImage.style.opacity = "1";

    defeatText.style.transition = "opacity 1s ease-in-out";
    defeatText.style.opacity = "1";
  }, 100);
  setTimeout(() => {
    defeatImage.style.transition = "opacity 1s ease-in-out";
    defeatText.style.transition = "opacity 1s ease-in-out";
    defeatImage.style.opacity = "0";
    defeatText.style.opacity = "0";
    setTimeout(() => {
      defeatImage.remove();
      defeatText.remove();
      showCurtains();
      restoreOriginalLineup();
      closeCurtains();
      setTimeout(() => {
        showNonBattleElements();
        coins += 10;
        localStorage.removeItem("result");
        dimmerOverlay.classList.add("hidden");
        openCurtains(() => {
          resetGame();
          window.location.href = "/menu/menu.html";
        });
      }, 1000);
    }, 1000);
  }, 2000);
}
function showWinScreen() {
  hideBattleText()
  const winSound = new Audio("../assets/sound/win sound.mp3");
  winSound.currentTime = 0;
  winSound.play();
  const dimmerOverlay = document.getElementById("dimmerOverlay");
  dimmerOverlay.classList.remove("hidden");
  const winContainer = document.createElement("div");
  winContainer.id = "winContainer";
  winContainer.style.position = "fixed";
  winContainer.style.zIndex = "123123";
  winContainer.style.width = "13.125rem";
  winContainer.style.height = "13.125rem";
  winContainer.style.top = "50%";
  winContainer.style.left = "50%";
  winContainer.style.transform = "translate(-50%, -50%)";
  winContainer.style.display = "flex";
  winContainer.style.justifyContent = "center";
  winContainer.style.alignItems = "center";
  const winImage = new Image();
  winImage.src = "../assets/game-asset/win.png";
  winImage.id = "winImage";
  winImage.style.width = "100%";
  winImage.style.height = "100%";
  winImage.style.position = "absolute";
  winImage.style.opacity = "0";
  winImage.style.top = "50%";
  winImage.style.left = "50%";
  winImage.style.transform = "translate(-50%, -50%)";
  winImage.style.animation = "fadeIn 1s ease-in-out forwards";
  const sunray = document.createElement("div");
  sunray.id = "sunray";
  sunray.style.position = "absolute";
  sunray.style.width = "200%";
  sunray.style.height = "200%";
  sunray.style.top = "50%";
  sunray.style.left = "50%";
  sunray.style.transform = "translate(-50%, -50%)";
  sunray.style.borderRadius = "50%";
  sunray.style.background = `
      radial-gradient(circle, 
      rgba(255, 255, 0, 0.3) 0%, 
      rgba(255, 204, 0, 0.1) 50%, 
      transparent 70%)
    `;
  sunray.style.animation =
    "spin 3s linear infinite, pulse 2s ease-in-out infinite";
  winContainer.appendChild(sunray);
  winContainer.appendChild(winImage);
  document.body.appendChild(winContainer);
  let pendingCoins = parseInt(localStorage.getItem("pendingCoins")) || 0;
  pendingCoins += 5;
  localStorage.setItem("pendingCoins", pendingCoins);
  setTimeout(() => {
    winContainer.style.transition = "opacity 1s ease-in-out";
    winContainer.style.opacity = "0";
    setTimeout(() => {
      winContainer.remove();
      showCurtains();
      closeCurtains();
      setTimeout(() => {
        showNonBattleElements();
        restoreOriginalLineup();
        hideCanvas();
        coins += 10;
        localStorage.removeItem("result");
        dimmerOverlay.classList.add("hidden");
        openCurtains(() => {
          updateCoinsDisplay();
          rollfirst();
          location.reload();
        });
      }, 1000);
    }, 1000);
  }, 3000);
}
function updateBattleText(onComplete) {
  const yourTeamNameElement = document.getElementById("teamNameEnemy");
  const enemyTeamNameElement = document.getElementById("teamNameYour");
  const vsLabelElement = document.getElementById("vsLabel");
  yourTeamNameElement.textContent = teamName;
  enemyTeamNameElement.textContent = enemyTeamName;
  yourTeamNameElement.style.opacity = 0;
  enemyTeamNameElement.style.opacity = 0;
  vsLabelElement.style.opacity = 0;
  enemyTeamNameElement.style.transform = "translateY(-50px)";
  yourTeamNameElement.style.transform = "translateY(-50px)";
  vsLabelElement.style.transform = "translateY(-50px)";
  yourTeamNameElement.style.display = "block";
  enemyTeamNameElement.style.display = "block";
  vsLabelElement.style.display = "block";
  setTimeout(() => {
    enemyTeamNameElement.style.transition = "opacity 0.5s, transform 0.5s";
    enemyTeamNameElement.style.opacity = 1;
    enemyTeamNameElement.style.transform = "translateY(0)";
  }, 1000);
  setTimeout(() => {
    yourTeamNameElement.style.transition = "opacity 0.5s, transform 0.5s";
    yourTeamNameElement.style.opacity = 1;
    yourTeamNameElement.style.transform = "translateY(0)";
  }, 500);
  setTimeout(() => {
    vsLabelElement.style.transition = "opacity 0.5s, transform 0.5s";
    vsLabelElement.style.opacity = 1;
    vsLabelElement.style.transform = "translateY(0)";
  }, 1500);
  setTimeout(() => {
    if (onComplete) onComplete();
  }, 2000);
}
function showBattleText() {
  document.getElementById("teamNameYour").style.display = "block";
  document.getElementById("teamNameEnemy").style.display = "block";
  document.getElementById("vsLabel").style.display = "block";
}
function hideBattleText() {
  document.getElementById("teamNameYour").style.display = "none";
  document.getElementById("teamNameEnemy").style.display = "none";
  document.getElementById("vsLabel").style.display = "none";
}
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.classList.add("active");
  loadingScreen.classList.remove("hidden");
}
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.classList.remove("active");
  loadingScreen.classList.add("hidden");
}
function computeBattleResult(playerTeam, enemyTeam) {
  
  const playerTeamCopy = playerTeam.map((animal) =>
    animal ? { ...animal } : null
  );
  const enemyTeamCopy = enemyTeam.map((animal) =>
    animal ? { ...animal } : null
  );

  let playerIndex = 0; 
  let enemyIndex = 0; 

  while (
    playerIndex < playerTeamCopy.length &&
    enemyIndex < enemyTeamCopy.length
  ) {
    let playerAnimal = playerTeamCopy[playerIndex];
    let enemyAnimal = enemyTeamCopy[enemyIndex];

    
    if (!playerAnimal) {
      playerIndex++;
      continue;
    }
    if (!enemyAnimal) {
      enemyIndex++;
      continue;
    }

    
    enemyAnimal.health -= playerAnimal.attack; 
    if (enemyAnimal.health <= 0) {
      enemyIndex++; 
      continue;
    }

    playerAnimal.health -= enemyAnimal.attack; 
    if (playerAnimal.health <= 0) {
      playerIndex++; 
    }
  }

  
  const playerSurvivors = playerTeamCopy.filter(
    (animal) => animal && animal.health > 0
  ).length;
  const enemySurvivors = enemyTeamCopy.filter(
    (animal) => animal && animal.health > 0
  ).length;

  if (playerSurvivors > enemySurvivors) return "win";
  if (playerSurvivors < enemySurvivors) return "lose";
  return "draw";
}
function animateSpriteWin(){
  
}
function aniamteSpriteDraw(){

}
function aniamtSpriteLose(){

}