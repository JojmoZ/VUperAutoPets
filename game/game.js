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
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
  if (!ownedAnimals || ownedAnimals.length === 0) {
    alert("You don't have any owned animals. Redirecting...");
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

  // Combine frozen and new animals
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
  if (coins >= 1) {
    coins -= 1;
    updateCoinsDisplay();

    // Filter out frozen animals
    const frozenAnimals = randomAnimals.filter(
      (animal) => animal && animal.frozen
    );
    const numFrozenAnimals = frozenAnimals.length;

    // Generate new animals for the non-frozen slots
    const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
    const availableAnimals = ownedAnimals ? ownedAnimals : shopAnimals;
    const newRandomAnimals = availableAnimals
      .sort(() => Math.random() - 0.5)
      .slice(0, maxShopAnimals - numFrozenAnimals);

    // Combine frozen and new animals
    randomAnimals = [...frozenAnimals, ...newRandomAnimals];

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
    animalImage.style.aspectRatio = "1/1";
    animalImage.setAttribute("draggable", true);
    animalImage.style.transform = "scaleX(-1)";
    animalImage.addEventListener("dragstart", (event) => {
      hideHoverInfo();

      // Get image dimensions or fallback to default values
      const imageWidth = animalImage.offsetWidth; // Displayed width
      const imageHeight = animalImage.offsetHeight; // Displayed height

      // Create a temporary canvas
     const tempCanvas = document.createElement("canvas");
     tempCanvas.width = imageWidth;
     tempCanvas.height = imageHeight;
      const ctx = tempCanvas.getContext("2d");

      // Debugging: Set a green background on the canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0)"; // Green with 50% transparency
     ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

       ctx.scale(-1, 1);
       ctx.drawImage(animalImage, -imageWidth, 0, imageWidth, imageHeight);

      // Debugging: Append the canvas to the body to visualize it
      document.body.appendChild(tempCanvas);
      tempCanvas.style.position = "absolute";
      tempCanvas.style.top = "10px";
      tempCanvas.style.left = "10px";
      tempCanvas.style.aspectRatio = "1/1";

      // Set the custom drag image
      event.dataTransfer.setDragImage(
        tempCanvas,
        tempCanvas.width / 2,
        tempCanvas.height / 2
      );

      event.dataTransfer.setData("text/plain", index); // Existing data
      event.dataTransfer.setData("source", "shop"); // New data to identify source
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
  const slotIndex = parseInt(event.currentTarget.getAttribute("data-slot"), 10);
  const reversedSlotIndex = maxSlots - 1 - slotIndex;
  const data = event.dataTransfer.getData("text/plain");
  const source = event.dataTransfer.getData("source"); // Get the source identifier
  console.log("a");
  if (source === "shop") {
    // Handle dragging from the shop
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
  } else if (source === "battle") {
    // Handle dragging from the battle lineup
    const animalIndex = parseInt(data, 10);
    const draggedFromSlot = battleLineup[animalIndex];
    if (draggedFromSlot) {
      const temp = battleLineup[reversedSlotIndex];
      battleLineup[reversedSlotIndex] = draggedFromSlot;
      battleLineup[animalIndex] = temp;
      renderBattleSlots();
      saveBattleLineup();
    }
  } else if (source === "item") {
    const itemName = event.dataTransfer.getData("itemName");
    const itemEffect = event.dataTransfer.getData("itemEffect");
    const targetAnimal = battleLineup[reversedSlotIndex]; // The animal in the drop slot
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
      // Clear slot and create a wrapper for the animal and stats
      slot.innerHTML = "";

      const wrapper = document.createElement("div");
      wrapper.classList.add("animal-wrapper"); // Add a wrapper to control layout

      // Animal Image
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

      // Attach drag events
      animalImg.addEventListener("dragstart", (event) => {
        hideHoverInfo();
        // Get image dimensions or fallback to default values
        const imageWidth = animalImg.offsetWidth; // Displayed width
        const imageHeight = animalImg.offsetHeight; // Displayed height

        // Create a temporary canvas
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        const ctx = tempCanvas.getContext("2d");

        // Debugging: Set a green background on the canvas
        ctx.fillStyle = "rgba(255, 255, 255, 0)"; // Green with 50% transparency
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        ctx.scale(-1, 1);
        ctx.drawImage(animalImg, -imageWidth, 0, imageWidth, imageHeight);

        // Debugging: Append the canvas to the body to visualize it
        document.body.appendChild(tempCanvas);
        tempCanvas.style.position = "absolute";
        tempCanvas.style.top = "10px";
        tempCanvas.style.left = "10px";
        tempCanvas.style.aspectRatio = "1/1";

        // Set the custom drag image
        event.dataTransfer.setDragImage(
          tempCanvas,
          tempCanvas.width / 2,
          tempCanvas.height / 2
        );
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

      // Stat Container
      const statContainer = document.createElement("div");
      statContainer.classList.add("stat-container");

      const attack = document.createElement("p");
      attack.textContent = animal.attack;
      const health = document.createElement("p");
      health.textContent = animal.health;

      statContainer.appendChild(attack);
      statContainer.appendChild(health);

      wrapper.appendChild(animalImg);
      wrapper.appendChild(statContainer);
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
        ctx.save(); // Save the canvas state
        // Translate and flip horizontally
        const xPosition = teamOffsetX + (maxSlots - 1 - index) * 100;
        const yPosition = commonY;
        ctx.translate(xPosition + 40, yPosition + 40); // Center of the image
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(img, -40, -40, 80, 80); // Adjust for the flipped state
        ctx.restore(); // Restore the canvas state

        // Draw fist and stats (unmirrored)
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
  rollShopAnimals();
  refreshItems();
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
      if (canPlay) {
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
      } else {
        alert("no animal in battle lineup");
      }
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
        
         ctx.save();
         // Translate and flip horizontally
         ctx.translate(currentX + 40, targetY + 40); // Center of the image
         ctx.scale(-1, 1); // Flip horizontally
         // Draw the image (adjusted for the flipped state)
         ctx.drawImage(img, -40, -40, 80, 80);
         // Restore the canvas state
         ctx.restore();
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
  hideCanvas();
  document.getElementById("battleSlotsContainer").classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("refreshButton").classList.remove("hidden");
  document.getElementById("startBattleButton").classList.remove("hidden");
  document.getElementById("freezeButton").classList.remove("hidden");
  document.getElementById("backArrow").classList.remove("hidden");
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
  randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
  if (!localStorage.getItem("firstTime")) {
    // First time playing: initialize with 15 coins and roll initial animals
    localStorage.setItem("firstTime", true); // Mark as not the first time anymore
    coins = 15; // Start with 15 coins
    localStorage.setItem("gamecoins", coins); // Save to localStorage

    rollfirst(); // Call rollFirst during the first session
  } else {
    // Not first time: load saved coins and animals
    coins = parseInt(localStorage.getItem("gamecoins")) || 0;
    updateCoinsDisplay();

    randomAnimals = JSON.parse(localStorage.getItem("randomAnimals")) || [];
    if (randomAnimals.length === 0) {
      console.log("Shop is empty. Wait for the player to refresh manually.");
      renderRandomAnimals(); // Render empty shop if necessary
    } else {
      console.log("Loaded existing random animals.");
      renderRandomAnimals(); // Render existing animals
    }
  }
  if (localStorage.getItem("battleLineup")) {
    battleLineup = JSON.parse(localStorage.getItem("battleLineup"));
    renderTeams();
    renderBattleSlots();
  }
  fetch("../assets/items.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      items = data;
      console.log(items);
      if (items.length === 0) {
        console.error("No items found in the JSON data.");
      } else {
        console.log("Items loaded successfully:", items);
        loadRandomItems();
      }
    })
    .catch((error) => console.error("Error loading items:", error));
  updateCoinsDisplay();
});
function updateCoinsDisplay() {
  localStorage.setItem("gamecoins", coins);
  document.getElementById("coins").textContent = `Coins: ${coins}`;
}
function generateEnemyTeam() {
  // enemyLineup = [
  //   shopAnimals.find((animal) =>  animal.name === "t-reXY"),
  // ];
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

  const bandageImg = new Image();
  bandageImg.src = "../assets/hurt.png"; // Path to the bandage image

  playerImg.onload = () => {
    enemyImg.onload = () => {
      requestAnimationFrame(animate);
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

    // Draw the player's animal
    ctx.save();
    ctx.translate(playerX + 40, playerY + 40); // Center of the player's image
    ctx.scale(-1, 1); // Flip horizontally
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

    // Draw the enemy's animal
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
      // Delay for the bandage effect
      setTimeout(() => {
        // Draw the bandage effect
        const bandageSize = 60; // Size of the bandage
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

        // Call showDamage after the bandage is visible
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
        }, 300); // Wait 500ms before proceeding to the next step
      }, 1); // Wait 500ms before showing the bandage
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

      ctx.save();
      ctx.translate(playerX + 40, playerY + 40); // Center of the player's image
      ctx.scale(-1, 1); // Flip horizontally
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
  function drawExpandingDamage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderFullTeam();
     ctx.save();
     ctx.translate(playerX + 40, commonY + 40); // Center of the player's image
     ctx.scale(-1, 1); // Flip horizontally
     ctx.drawImage(playerImg, -40, -40, 80, 80);
     ctx.restore();
    // ctx.drawImage(playerImg, playerX, commonY, 80, 80);
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
     ctx.translate(playerX + 40, commonY + 40); // Center of the player's image
     ctx.scale(-1, 1); // Flip horizontally
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
      ctx.save(); // Save the current state of the canvas
      ctx.translate(xPos + imgSize / 2, commonY + imgSize / 2); // Move to the center of the image
      ctx.scale(-1, 1); // Flip horizontally
      ctx.drawImage(
        getAnimalImage(animal.img),
        -imgSize / 2, // Adjust for flipped coordinates
        -imgSize / 2,
        imgSize,
        imgSize
      );
      ctx.restore(); // Restore the canvas state
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
        ctx.save(); 
     if (teamType === "player") {
       // Mirror the image if it's the player's team
       ctx.translate(curveX + 30, curveY + 30); // Center of the image
       ctx.scale(-1, 1); // Flip horizontally
       ctx.drawImage(img, -30, -30, 60, 60); // Adjust for flipped coordinates
     } else {
       // Draw normally for the enemy team
       ctx.drawImage(img, curveX, curveY, 60, 60);
     }
 ctx.restore(); 
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
        if (playerAnimal.specialEffect === "SpawnBus") {
          // Spawn a Bus in the player's lineup
          const playerIndex = battleLineup.indexOf(playerAnimal);
          battleLineup[playerIndex] = createBus();
          console.log(battleLineup);
          console.log("A Bus has spawned for the player!");
          renderBattleSlots(); // Refresh the UI to reflect the new lineup
          resolve(); // Resolve the promise to indicate this death has been handled
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
      console.log("a");
      const enemyAnimalIndex = enemyLineup.findIndex(
        (animal) => animal !== null
      );
      const enemyAnimal = enemyLineup[enemyAnimalIndex];
      if (enemyAnimal) {
        console.log("b");
        animateHeadbutt(playerAnimal, enemyAnimal, () => {
          enemyAnimal.health -= playerAnimal.attack;
          playerAnimal.health -= enemyAnimal.attack;
          console.log("d");
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
    // Show the dimmer overlay
    const dimmerOverlay = document.getElementById("dimmerOverlay");
    dimmerOverlay.classList.remove("hidden");

    middleHeart.src = "../assets/heart.png";
    middleHeart.classList.remove("hidden");

    setTimeout(() => {
      middleHeart.src = "../assets/semibroken.png";
    }, 1000);

    setTimeout(() => {
      // Capture current position
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
          setTimeout(() => {
            showNonBattleElements();
            dimmerOverlay.classList.add("hidden");
            openCurtains(() => {
              location.reload();
            });
          }, 1000);
        }
      }, 1000); // Matches animation duration
    }, 1500); // Delay before starting the drop animation
  }
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
  // saveRandomAnimals();
  showNonBattleElements();
}
function checkGameOver(playerSurvivors, enemySurvivors) {
  if (playerSurvivors > enemySurvivors) {
    console.log("User wins!");
    alert("You won this battle! Continue to the next.");
    showNonBattleElements();
    // location.reload();
  } else if (playerSurvivors < enemySurvivors) {
    loseLife();
  } else {
    console.log("It's a draw!");
    alert("It's a draw! Continue to the next battle.");
    showNonBattleElements();
    // location.reload();
  }
  rollfirst();
  restoreOriginalLineup();
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
  battleLineup[slotIndex] = null; // Remove the animal from the lineup
  renderBattleSlots();
  saveBattleLineup();
}
trashBin.addEventListener("dragover", (event) => {
  event.preventDefault();
});
trashBin.addEventListener("drop", (event) => {
  event.preventDefault();
  const slotIndex = event.dataTransfer.getData("text");
  battleLineup[slotIndex] = null; // Remove the animal from the lineup
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
    // Handle freezing an animal from the shop
    const animal = randomAnimals[index];
    if (animal) {
      animal.frozen = !animal.frozen;
      saveRandomAnimals();
      renderRandomAnimals();
    }
  } else if (source === "item") {
    // Toggle the frozen state for each item slot based on the slotId
    if (slotId === "itemSlot" && currentItem1) {
      currentItem1.frozen = !currentItem1.frozen;
    } else if (slotId === "itemSlot2" && currentItem2) {
      currentItem2.frozen = !currentItem2.frozen;
    }
    saveCurrentItems(); // Save the updated frozen states
    renderItem(); // Re-render the items to show the frozen overlay
  }
});
let items = [];
let currentItem1 = null;
let currentItem2 = null;

function loadRandomItems() {
  const savedItems = JSON.parse(localStorage.getItem("currentItems")) || [];

  // Load items from saved state
  currentItem1 = savedItems[0] ? { ...savedItems[0] } : null;
  currentItem2 = savedItems[1] ? { ...savedItems[1] } : null;

  renderItem(); // Render the items in the UI
}
function refreshItems() {
  if (items.length === 0) {
    console.error("No items available to generate!");
    return;
  }

  // Generate new items unless they're frozen
  if (!currentItem1?.frozen) {
    currentItem1 = { ...items[Math.floor(Math.random() * items.length)] };
  }
  if (!currentItem2?.frozen) {
    currentItem2 = { ...items[Math.floor(Math.random() * items.length)] };
  }

  saveCurrentItems(); // Save the updated items to localStorage
  renderItem(); // Render the new items in the UI
}
function handleItemDrop(event, animal) {
  event.preventDefault();
  const itemName = event.dataTransfer.getData("itemName");
  const itemEffect = event.dataTransfer.getData("itemEffect");
  const slotId = event.dataTransfer.getData("slotId");

  if (itemName && itemEffect && animal) {
     let item = items.find((i) => i.name === itemName);
     if (item) itemCost = item.cost;
     if (coins < itemCost) {
       alert("Not enough coins to buy this item!");
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
      showHoverInfo(`${item.name} - Cost: ${item.cost} - Effect: ${item.effect}`, event);
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
    event.dataTransfer.setData("slotId", "itemSlot"); // Include slot ID for freeze functionality
  } else if (slotId === "itemSlot2") {
    event.dataTransfer.setData("itemName", currentItem2.name);
    event.dataTransfer.setData("itemEffect", currentItem2.effect);
    event.dataTransfer.setData("slotId", "itemSlot2"); // Include slot ID for freeze functionality
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
    console.log("makan strawberry");
    animal.health += 1;
    animal.attack += 1;
  } else if(itemName == "Bus"){
    animal.specialEffect = "SpawnBus";
  }
  updateCoinsDisplay(); // Update the displayed coin count.
  renderBattleSlots(); // Refresh the animal stats display
  saveBattleLineup();
}
function createBus() {
  return {
    name: "Bus",
    img: "../assets/items/Bus.png",
    attack: 5, // Example stats
    health: 1,
    cost: 0,
    color: "green",
  };
}
