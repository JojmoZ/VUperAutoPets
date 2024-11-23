const canvas = document.getElementById("battleCanvas");
const curtainTop = document.getElementById("curtainTop");
const curtainBottom = document.getElementById("curtainBottom");
let ctx = canvas.getContext("2d");
const heartImg = new Image();
const fistImg = new Image();
let enemyLineup = [null, null, null, null, null];
let battleLineup = JSON.parse(localStorage.getItem("battleLineup")) || [
  null,
  null,
  null,
  null,
  null,
];
let randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
let coins;
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
    animalImage.setAttribute("draggable", true);
    animalImage.style.transform = "scaleX(-1)";
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
      document.body.appendChild(tempCanvas);
      tempCanvas.style.top = "0.625rem";
      tempCanvas.style.left = "0.625rem";
      tempCanvas.style.aspectRatio = "1/1";
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
    attackIcon.src = "../assets/fist.png";
    const attackText = document.createElement("span");
    attackText.textContent = animal.attack;
    attackText.classList.add("stat-text");
    attackContainer.appendChild(attackIcon);
    attackContainer.appendChild(attackText);
    const healthContainer = document.createElement("div");
    healthContainer.classList.add("stat-icon");
    const healthIcon = document.createElement("img");
    healthIcon.src = "../assets/heart.png";
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
      currentAnimal.level < 3
    ) {
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
      targetAnimal.name == draggedFromSlot.name && animalIndex !== reversedSlotIndex
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
      battleLineup[animalIndex] = null;
      renderBattleSlots();
      saveBattleLineup();
    } else if (draggedFromSlot && !targetAnimal ) {
      const temp = battleLineup[reversedSlotIndex];
      battleLineup[reversedSlotIndex] = draggedFromSlot;
      battleLineup[animalIndex] = temp;
      renderBattleSlots();
      saveBattleLineup();
    }
  } else if (source === "item") {
    // free
    const itemName = event.dataTransfer.getData("itemName");
    const itemEffect = event.dataTransfer.getData("itemEffect");
    const targetAnimal = battleLineup[reversedSlotIndex];
    if (targetAnimal) {
      handleItemDrop(event, targetAnimal);
    }
  }
}
function handleDragOver(event) {
  event.preventDefault();
}
const hoverInfo = document.getElementById("hoverInfo");
function showHoverInfo(text, event) {
  hoverInfo.textContent = text;
  hoverInfo.style.left = `${event.pageX + 10}px`;
  hoverInfo.style.top = `${event.pageY + 10}px`;
  hoverInfo.style.opacity = 1;
}
function hideHoverInfo() {
  hoverInfo.style.opacity = 0;
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
        levelImg.src = `../assets/Lv${animal.level}.png`; 
      } else {
        levelImg.src = `../assets/Lv${animal.level}_${animal.bar}.png`; 
      }
      levelImg.alt = `Level ${animal.level} Bar ${animal.bar}`;
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
      attackIcon.src = "../assets/fist.png";
      const attackText = document.createElement("span");
      attackText.textContent = animal.attack;
      attackText.classList.add("stat-text");
      attackContainer.appendChild(attackIcon);
      attackContainer.appendChild(attackText);
      const healthContainer = document.createElement("div");
      healthContainer.classList.add("stat-icon");
      const healthIcon = document.createElement("img");
      healthIcon.src = "../assets/heart.png";
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
        document.body.appendChild(tempCanvas);
        tempCanvas.style.top = "0.625rem";
        tempCanvas.style.left = "0.625rem";
        tempCanvas.style.aspectRatio = "1/1";
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
        ctx.font = "1rem Arial";
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
        ctx.font = "1rem Arial";
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
        ctx.font = "1rem Arial";
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
        ctx.font = "1rem Arial";
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
    coins -= 1;
    rollShopAnimals();
    refreshItems();
  } else {
    const coinsDisplay = document.getElementById("coinIcon");
    jitterImage(coinsDisplay)
    return;
  }
});
function checkbattlelineup() {
  const battleLineup = JSON.parse(localStorage.getItem("battleLineup"));
  battleLineup.forEach((animal) => {
    if (animal != null) {
      canPlay = true;
    }
  });
}
let playing = false;
let canPlay = false;
document
  .getElementById("startBattleButton")
  .addEventListener("click", function () {
    if (!playing) {
      checkbattlelineup();
      // if (canPlay) {
        showCurtains();
        playing = true;
        closeCurtains();
        setTimeout(() => {
          backupLineup();
          shiftAnimalsToFront();
          console.log("Before generateEnemyTeam");
          generateEnemyTeam();
          console.log("After generateEnemyTeam");

          console.log("Before hideNonBattleElements");
          hideNonBattleElements();
          console.log("After hideNonBattleElements");

          console.log("Before hideCanvas");
          hideCanvas();
          console.log("After hideCanvas");

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
  document.getElementById("freezeButton").classList.remove("hidden");
  document.getElementById("backArrow").classList.remove("hidden");
}
function hideNonBattleElements() {
  console.log('hiding')
  document.getElementById("battleSlotsContainer").classList.add("hidden");
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("refreshButton").classList.add("hidden");
  document.getElementById("startBattleButton").classList.add("hidden");
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

}
document.getElementById("backArrow").addEventListener("click", function () {  
  window.location.href = "/home/homepage.html";
})
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
  fistImg.src = "../assets/fist.png";
  heartImg.src = "../assets/heart.png";
}
document.addEventListener("DOMContentLoaded", function () {
  loadassets();
  hideCurtains();
  adjustCanvasSize();
  window.addEventListener("resize", adjustCanvasSize);
  updateHeartsDisplay();
  if (localStorage.getItem("battleLineup")) {
    battleLineup = JSON.parse(localStorage.getItem("battleLineup"));
    renderTeams();
    renderBattleSlots();
  }
  randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
  if (!localStorage.getItem("firstTime")) {
    localStorage.setItem("firstTime", true); 
    coins = 15; 
    localStorage.setItem("gamecoins", coins); 
    rollfirst();
  } else {
    coins = parseInt(localStorage.getItem("gamecoins")) || 0;
    updateCoinsDisplay();
    randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
    if (randomAnimals.length === 0) {
      renderRandomAnimals(); 
    } else {
      renderRandomAnimals(); 
    }
  }
  fetch("../assets/items.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched items:", data); // Debug fetched items
      items = data;
      if (items.length === 0) {
        console.error("No items found in the JSON data.");
      } else {
        refreshItems(); // Ensure items are generated
      }
    })
    .catch((error) => console.error("Error loading items:", error));
  updateCoinsDisplay();
});
function updateCoinsDisplay() {
  localStorage.setItem("gamecoins", coins);
  document.getElementById("coins").textContent = coins; 
}
function generateEnemyTeam() {
  const totalPlayerCoins = coins; // Use player's current coins as the basis
  const enemyTeamCost = totalPlayerCoins; // Match enemy team cost to player coins
  let currentCost = 0;
  enemyLineup = [];

 let attempts = 0;
 const maxAttempts = 100; // Prevent infinite loop

 while (enemyLineup.length < maxSlots && currentCost < enemyTeamCost) {
   const randomAnimal = {
     ...shopAnimals[Math.floor(Math.random() * shopAnimals.length)],
   };

   if (currentCost + randomAnimal.cost <= enemyTeamCost) {
     enemyLineup.push(randomAnimal);
     currentCost += randomAnimal.cost;
   }

   attempts++;
   if (attempts > maxAttempts) {
     console.warn("Failed to generate full enemy lineup. Exiting loop.");
     break;
   }
 }


  // Fill remaining slots with null if team is incomplete
  while (enemyLineup.length < maxSlots) {
    enemyLineup.push(null);
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
  const duration = 500; 
  let currentFrame = 0;
  let lastFrameTime = performance.now();
  const playerImg = new Image();
  playerImg.src = playerAnimal.img;
  const enemyImg = new Image();
  enemyImg.src = enemyAnimal.img;
  const bandageImg = new Image();
  bandageImg.src = "../assets/hurt.png"; 
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

    
    ctx.save();
    ctx.translate(playerX + 40, playerY + 40); 
    ctx.scale(-1, 1); 
    ctx.drawImage(playerImg, -40, -40, 80, 80);
    ctx.restore();
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
  const shiftedLineup = battleLineup.filter((animal) => animal !== null);
   if (shiftedLineup.length === 0) {
     console.warn("No animals in lineup. Skipping shift.");
     return; // No need to shift if there are no animals
   }
  while (shiftedLineup.length < maxSlots) {
    shiftedLineup.push(null);
  }
  battleLineup = [...shiftedLineup];
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
  const starImg = new Image();
  starImg.src = "../assets/star.png";

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
      ctx.translate(curveX + 30, curveY + 30); // Mirror the image
      ctx.scale(-1, 1); // Flip horizontally
      ctx.drawImage(img, -30, -30, 60, 60); // Draw the animal
    } else {
      ctx.drawImage(img, curveX, curveY, 60, 60);
    }
    ctx.restore();

    currentFrame += deltaTime * totalFrames * 2; // Control animation speed

    // Check for collision with the edge of the screen
    if (
      (teamType === "player" && curveX <= 0) ||
      (teamType !== "player" && curveX >= canvas.width)
    ) {
      triggerStarExplosion(curveX, curveY, () => {
        onComplete();
      });
      return; // Stop the animation
    }

    if (currentFrame < totalFrames) {
      requestAnimationFrame(animate);
    }
  }

  function triggerStarExplosion(x, y, explosionComplete) {
    const explosionDuration = 40; // Duration of explosion in frames
    let explosionFrame = 0;
    const maxRadius = 150; // Increase explosion radius
    const starSize = 80; // Make stars larger

    function drawExplosion() {
      ctx.clearRect(x - maxRadius, y - maxRadius, maxRadius * 2, maxRadius * 2); // Clear area around the explosion
      renderFullTeam(); // Render background or other elements

      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2; // Spread stars evenly
        const radius = (explosionFrame / explosionDuration) * maxRadius; // Expand explosion radius
        const starX = x + Math.cos(angle) * radius;
        const starY = y + Math.sin(angle) * radius;

        ctx.globalAlpha = 1 - explosionFrame / explosionDuration; // Fade out
        ctx.drawImage(
          starImg,
          starX - starSize / 2,
          starY - starSize / 2,
          starSize,
          starSize
        ); // Draw stars
      }

      ctx.globalAlpha = 1; // Reset opacity

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
function handleBothDeaths(playerAnimal, enemyAnimal, onComplete) {
  const deathPromises = [];
  if (playerAnimal.health <= 0) {
    deathPromises.push(
      new Promise((resolve) => {
        if (playerAnimal.specialEffect === "SpawnBus") {
          const playerIndex = battleLineup.indexOf(playerAnimal);
          battleLineup[playerIndex] = createBus();
          resolve(); 
        } else {
          animateDeathFlyOff(
            playerAnimal,
            battleLineup.indexOf(playerAnimal),
            "player",
            resolve
          );
        }
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
      enemyLineup[enemyLineup.indexOf(enemyAnimal)] = null;
      shiftAnimalsInLineup(enemyLineup);
    }
    if (playerAnimal.health <= 0) {
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
      heart.src = "../assets/heart.png"; 
    } else {
      heart.src = "../assets/broken heart.png"; 
    }
  });
}
function resetGame() {
  battleLineup = [null, null, null, null, null];
  enemyLineup = [null, null, null, null, null];
  localStorage.removeItem("randomAnimals");
  localStorage.removeItem("currentItems");
  localStorage.removeItem("firstTime");
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
function showDefeatScreen() {
  const defeatScreen = document.getElementById("defeatScreen");
  defeatScreen.classList.remove("hidden");
  setTimeout(() => {
    resetGame();
    window.location.href = "/home/homepage.html";
  }, 3000);
}
const trashBin = document.getElementById("trashBin");
const freezeButton = document.getElementById("freezeButton");
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
    hideFreezeBin()
  }
});
let items = [];
let currentItem1 = null;
let currentItem2 = null;
function loadRandomItems() {
  const savedItems = JSON.parse(localStorage.getItem("currentItems")) || [];
  currentItem1 = savedItems[0] ? { ...savedItems[0] } : null;
  currentItem2 = savedItems[1] ? { ...savedItems[1] } : null;
  if (!currentItem1 && !currentItem2) {
    refreshItems(); // Generate random items if none are saved
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
  hideFreezeBin()
  if (itemName && itemEffect && animal) {
    let item = items.find((i) => i.name === itemName);
    if (item) itemCost = item.cost;
    if (coins < itemCost) {
      const itemSlot = document.getElementById(slotId);
      jitterImage(itemSlot);
      return;
    }
    coins -= itemCost;
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
    const dimmerOverlay = document.getElementById("dimmerOverlay");
    dimmerOverlay.classList.remove("hidden");
    middleHeart.src = "../assets/heart.png";
    middleHeart.classList.remove("hidden");
    setTimeout(() => {
      middleHeart.src = "../assets/semibroken.png";
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
        hearts[lives - 1].src = "../assets/broken heart.png";
        lives--;
        localStorage.setItem("lives", lives);

        if (lives <= 0) {
          showDefeatScreen();
        } else {
          showCurtains();
          closeCurtains();
          restoreOriginalLineup();
          setTimeout(() => {
            showNonBattleElements();
            hideCanvas()
            dimmerOverlay.classList.add("hidden");
            openCurtains(() => {
              rollfirst();
              location.reload();
            });
          }, 1000);
        }
      }, 1000); 
    }, 1500); 
  }
}
function jitterImage(element) {
  if (!element) return;

  // Get the current transform value (if any)
  const currentTransform = window.getComputedStyle(element).transform;

  // Apply jitter with the existing transform
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
  const dimmerOverlay = document.getElementById("dimmerOverlay");
  dimmerOverlay.classList.remove("hidden");
  const frownImage = new Image();
  frownImage.src = "../assets/frown.png";
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
        dimmerOverlay.classList.add("hidden");
        openCurtains(() => {
          rollfirst();
          location.reload();
        });
      }, 1000);
    }, 1000); 
  }, 2000); 
}
function showWinScreen() {
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
  winImage.src = "../assets/win.png";
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
        hideCanvas()
        dimmerOverlay.classList.add("hidden");
        openCurtains(() => {
          rollfirst();
          location.reload();
        });
      }, 1000);
    }, 1000); 
  }, 3000); 
}
