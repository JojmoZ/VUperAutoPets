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
            commonY, // Use common Y position for consistency
            60,
            60
          );
        ctx.fillText(
          `A:${animal.attack}/H:${animal.health}`,
          teamOffsetX + (maxSlots - 1 - index) * 100,
          commonY + 80 // Text positioned consistently
        );
      }
    });

    enemyLineup.forEach((animal, index) => {
      if (animal) {
        const img = new Image();
        img.src = animal.img;
        img.onload = () =>
          ctx.drawImage(
            img,
            enemyOffsetX + index * 100,
            commonY, // Use common Y position for consistency
            60,
            60
          );
        ctx.fillText(
          `A:${animal.attack}/H:${animal.health}`,
          enemyOffsetX + index * 100,
          commonY + 80 // Text positioned consistently
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
   const playerStartX = 100 + (maxSlots - 1) * 100; // Player's starting X position
   const playerY = 150; // Lower Y position to keep animals lower in the canvas
   const enemyStartX = canvas.width - 550; // Enemy's starting X position
   const enemyY = 150; // Lower Y position for the enemy as well
   const centerX = canvas.width / 2 - 60; // Center X for headbutt animation
   const duration = 1000; // Animation duration
   const frameRate = 60; // Frame rate for smooth animation
   const totalFrames = (duration / 1000) * frameRate;
   let currentFrame = 0;

   const playerImg = new Image();
   playerImg.src = playerAnimal.img;

   const enemyImg = new Image();
   enemyImg.src = enemyAnimal.img;

   const bandageImg = new Image();
   bandageImg.src = "../assets/hurt.png"; // Path to your bandage image

   playerImg.onload = () => {
     enemyImg.onload = () => {
       requestAnimationFrame(animate);
     };
   };

   function animate() {
     // Clear the entire canvas before rendering anything
     ctx.clearRect(0, 0, canvas.width, canvas.height);

     // Re-render the rest of the team
     renderFullTeam();

     // Calculate the positions of the player and enemy during the animation
     const progress = easeInOutQuad(currentFrame / totalFrames);
     const playerX = playerStartX - (playerStartX - centerX) * progress;
     const enemyX = enemyStartX + (centerX + 60 - enemyStartX) * progress;

     // Draw the headbutting animals
     ctx.drawImage(playerImg, playerX, playerY, 60, 60); // Player animal
     ctx.fillText(
       `A:${playerAnimal.attack}/H:${playerAnimal.health}`,
       playerX,
       playerY + 80
     ); // Player stats

     ctx.drawImage(enemyImg, enemyX, enemyY, 60, 60); // Enemy animal
     ctx.fillText(
       `A:${enemyAnimal.attack}/H:${enemyAnimal.health}`,
       enemyX,
       enemyY + 80
     ); // Enemy stats

     // Bandage effect when animals are close
     if (progress > 0.8) {
       const bandageSize = 60;
       ctx.drawImage(
         bandageImg,
         playerX + 10,
         playerY,
         bandageSize,
         bandageSize
       );
       ctx.drawImage(bandageImg, enemyX + 10, enemyY, bandageSize, bandageSize);
     }

     // When the animation finishes, show the damage
     if (currentFrame >= totalFrames) {
       showDamage(playerX, playerAnimal.attack, enemyX, enemyAnimal.attack);
     }

     currentFrame++;
     if (currentFrame <= totalFrames) {
       requestAnimationFrame(animate);
     } else {
       // Handle both deaths after the headbutt completes
       setTimeout(
         () => handleBothDeaths(playerAnimal, enemyAnimal, onComplete),
         500
       );
     }
   }
 }







  function showDamage(playerX, playerDamage, enemyX, enemyDamage) {
    let alpha = 1.0;
    const fadeDuration = 1000;
    const commonY = 150;

    function drawDamage() {
      // Clear the entire canvas before rendering anything
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Re-render the entire team
      renderFullTeam();

      // Render the damage with fading effect
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(`-${playerDamage}`, playerX + 20, commonY - 20);
      ctx.fillText(`-${enemyDamage}`, enemyX + 20, commonY - 20);
      ctx.restore();

      // Fade out effect
      alpha -= 0.05;
      if (alpha > 0) {
        requestAnimationFrame(drawDamage);
      } else {
        ctx.globalAlpha = 1.0; // Reset the global alpha after fading out
      }
    }

    drawDamage();
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
  const totalFrames = 60; // Number of frames for the animation

  // Determine the starting positions based on team type (player or enemy)
  let startX, startY;
  if (teamType === "player") {
    startX = 100 + (maxSlots - 1 - index) * 100; // Player team's starting X position
    startY = 150; // Common Y position for player
  } else {
    startX = canvas.width - 550 + index * 100; // Enemy team's starting X position
    startY = 150; // Common Y position for enemy
  }

  const endX = teamType === "player" ? -100 : canvas.width + 100; // Final X position off-screen
  const controlPointX = (startX + endX) / 2; // Midpoint for the Bézier curve
  const controlPointY = startY - 400; // Lift the control point higher for a more pronounced arc

  function animate() {
    // Clear only the area where the animal was drawn on the previous frame
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
        (startY + 100); // Curve ends lower

    // Clear the area of the previous frame
    ctx.clearRect(previousX - 30, previousY - 30, 120, 120);

    // Re-render the full team without the dying animal
    renderFullTeam();

    // Calculate the Bézier curve position for the animal
    const progress = currentFrame / totalFrames;
    const curveX =
      (1 - progress) * (1 - progress) * startX +
      2 * (1 - progress) * progress * controlPointX +
      progress * progress * endX;

    const curveY =
      (1 - progress) * (1 - progress) * startY +
      2 * (1 - progress) * progress * controlPointY +
      progress * progress * (startY + 100); // Lowering the end

    // Draw the animal flying off along the curved path
    ctx.drawImage(img, curveX, curveY, 60, 60);

    currentFrame++;
    if (currentFrame < totalFrames) {
      requestAnimationFrame(animate); // Continue the animation
    } else {
      onComplete(); // Call the callback after animation completes
    }
  }

  animate(); // Start the animation
}


function handleBothDeaths(playerAnimal, enemyAnimal, onComplete) {
  const deathPromises = [];

  // Add player's death animation if they die
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

  // Add enemy's death animation if they die
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

  // Ensure both animations are completed before proceeding to the next step
  Promise.all(deathPromises).then(() => {
    // After both animations finish, we continue to onComplete
    onComplete();
  });
}




  // Call this function in simulateBattle when an animal dies
  function simulateBattle() {
    console.clear();
    let turnCount = 1;
    const maxTurns = 10;
    renderTeams();

    function pauseBeforeFirstTurn() {
      renderTeams();
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

            // Handle both deaths after headbutt animation finishes
            handleBothDeaths(playerAnimal, enemyAnimal, () => {
              // Update enemy team if dead
              if (enemyAnimal.health <= 0) {
                console.log(`Enemy's ${enemyAnimal.name} died`);
                enemyLineup[enemyAnimalIndex] = null;
                shiftAnimalsInLineup(enemyLineup);
                renderTeams();
              }

              // Update player team if dead
              if (playerAnimal.health <= 0) {
                console.log(`User's ${playerAnimal.name} died`);
                battleLineup[playerAnimalIndex] = null;
                shiftAnimalsInLineup(battleLineup);
                renderTeams();
              }

              turnCount++;
              setTimeout(playTurn, 1500); // Proceed to next turn after the animations
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
