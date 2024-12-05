document.addEventListener("DOMContentLoaded", function () {
  localStorage.removeItem("ingame");
  const lever = document.getElementById("lever");
  const gachaResult = document.getElementById("gachaResult");
  const h1Element = document.querySelector("h1[data-text='Try Your Luck!']");
  let shopAnimals = [];
  const username = localStorage.getItem("username");
  fetch("../assets/jsons/shopAnimals.json")
    .then((response) => response.json())
    .then((data) => {
      shopAnimals = data;
      console.log("shopAnimals loaded:", shopAnimals);
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));

  let isRolling = false;
  const logged = localStorage.getItem("loggedin");

  if (!logged) {
    // Function to recursively delete all items in localStorage except "users"
    function clearLocalStorageExceptUsers() {
      const keysToKeep = ["users"]; // Keys to preserve in localStorage

      // Get all keys currently in localStorage
      const allKeys = Object.keys(localStorage);

      // Loop through the keys and remove those not in the keysToKeep list
      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }

    // Call the function to clear localStorage
    clearLocalStorageExceptUsers();

    // Redirect to the login page
    window.location.href = "/login/index.html";
  }

  const coinsDisplay = document.getElementById("coinsDisplay");
  const backBtn = document.getElementById("backArrow");
  backBtn.addEventListener("click", function () {
    window.location.href = "/shop/shoppage.html";
  });
  const coinImg = document.createElement("img");
  coinImg.src = "../assets/game-asset/Gold.png";
  coinImg.style.width = "3rem";
  coinImg.style.height = "3rem";
  coinImg.style.position = "fixed";
  coinImg.style.top = "1.5rem";
  coinImg.style.right = "5.5rem";
  coinImg.style.zIndex = "9999";
  document.body.appendChild(coinImg);
  function updateCoinsDisplay() {
    const coins = localStorage.getItem("coins");
    coinsDisplay.style.fontFamily = "VUper";
    coinsDisplay.style.position = "fixed";
    coinsDisplay.style.top = "1.75rem";
    coinsDisplay.style.right = "9.375rem";
    coinsDisplay.style.color = "black";
    coinsDisplay.style.fontSize = "2rem";
    coinsDisplay.style.zIndex = "9999";
    coinsDisplay.textContent = `Coins: ${coins}`;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.displayName === username);
    if (userIndex !== -1) {
      users[userIndex].coins = coins;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }
  updateCoinsDisplay();
  let rolling = false;
  const gachaSound = document.getElementById("gachaSound");
  const winSound = document.getElementById("winSound");
  lever.addEventListener("mousedown", function () {
    if (isRolling) return;
    isRolling = true;
    lever.style.transform = "translateY(100px)";
    gachaSound.loop = true;
    gachaSound.play();
    setTimeout(() => {
      pullHandle();
    }, 500);
  });

  document.addEventListener("mouseup", function () {
    lever.style.transform = "translateY(0)";
  });

  function handleCheatActivation() {
    if (cheatAnimal) {
      const selectedAnimal = shopAnimals.find(
        (animal) => animal.name === cheatAnimal
      );
      if (selectedAnimal) {
        slot1.innerHTML = "";
        slot2.innerHTML = "";
        slot3.innerHTML = "";
        animateSlot(slot1, selectedAnimal, () => {
          animateSlot(slot2, selectedAnimal, () => {
            animateSlot(slot3, selectedAnimal, () => {
              isRolling = false;
              setTimeout(() => {
                checkThreeOfAKind(
                  selectedAnimal,
                  selectedAnimal,
                  selectedAnimal
                );
                addCheatAnimalToUser(selectedAnimal.name);
              }, 100);
            });
          });
        });
        cheatAnimal = "";
        return true;
      }
    }
    return false;
  }

  function addCheatAnimalToUser(animalName) {
    const animal = shopAnimals.find((a) => a.name === animalName);
    if (animal) {
      let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];
      if (!ownedAnimals.some((a) => a.name === animal.name)) {
        ownedAnimals.push(animal);
        localStorage.setItem("ownedAnimals", JSON.stringify(ownedAnimals));
      }
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(
        (user) => user.displayName === username
      );
      if (userIndex !== -1) {
        if (!users[userIndex].ownedAnimals) {
          users[userIndex].ownedAnimals = [];
        }
        if (
          !users[userIndex].ownedAnimals.some((a) => a.name === animal.name)
        ) {
          users[userIndex].ownedAnimals.push(animal);
          localStorage.setItem("users", JSON.stringify(users));
        }
      }
    }
  }

  function pullHandle() {
    const coins = parseInt(localStorage.getItem("coins"), 10);
    if (coins < 5) {
      ShowModal("You need at least 5 coins to play the Gacha!");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.displayName === username);
    if (userIndex !== -1) {
      if (!users[userIndex].pity) {
        users[userIndex].pity = 0;
      }
      users[userIndex].pity += 1;
      localStorage.setItem("users", JSON.stringify(users));
    }

    if (handleCheatActivation()) {
      localStorage.setItem("coins", (coins - 5).toString());
      updateCoinsDisplay();
      return;
    }

    // Get the columns (reels)
    const column1 = document.getElementById("column1");
    const column2 = document.getElementById("column2");
    const column3 = document.getElementById("column3");

    const selectedAnimals = [];
    const random = Math.random();

    // Handle rare rewards based on probability or pity count
    if (random < 0.02 || (users[userIndex] && users[userIndex].pity >= 50)) {
      const specialRewards = shopAnimals.filter((animal) =>
        ["MSeer", "VandaJ", "YenguiK", "PamstIr"].includes(animal.name)
      );
      const rareAnimal =
        specialRewards[Math.floor(Math.random() * specialRewards.length)];
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(rareAnimal); // One selected animal per column
      }
      if (userIndex !== -1) {
        users[userIndex].pity = 0; // Reset pity after a rare reward
        localStorage.setItem("users", JSON.stringify(users));
      }
    } else {
      // Generate random animals for each column
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(getRandomAnimal());
      }
    }

    // Deduct coins and update display
    localStorage.setItem("coins", (coins - 5).toString());
    updateCoinsDisplay();

    // Animate each column with a slight delay
    const columns = [column1, column2, column3];
    columns.forEach((column, index) => {
      spinColumn(column, selectedAnimals[index], () => {
        // Check for winning conditions after the last column stops
        if (index === columns.length - 1) {
          isRolling = false;
          gachaSound.pause();
          gachaSound.currentTime = 0;
          checkThreeOfAKind(selectedAnimals);
        }
      });
    });
  }


  function checkThreeOfAKind(selectedAnimals) {
    // Convert selectedAnimals to a 3x3 array
    const grid = [
      selectedAnimals.slice(0, 3),
      selectedAnimals.slice(3, 6), // Middle row
      selectedAnimals.slice(6, 9),
    ];

    // Check the middle row for three of a kind
    const middleRow = grid[1]; // Index 1 is the middle row
    if (
      middleRow[0].name === middleRow[1].name &&
      middleRow[1].name === middleRow[2].name
    ) {
      // Trigger win event for middle row match
      addToOwnedAnimals(middleRow[0]); // Add the winning animal to owned
      showFireworks();
      winSound.play();
    }
  }

  function showFireworks() {
    const fireworksContainer = document.getElementById("fireworks-container");
    const originalText = h1Element.innerText;
    h1Element.innerText = "YOU WIN!";
    h1Element.setAttribute("data-text", "YOU WIN!");
    fireworksContainer.style.display = "block";

    function launchFireworksRound() {
      for (let i = 0; i < 10; i++) {
        const fireworkLeft = document.createElement("div");
        fireworkLeft.classList.add("firework");
        fireworkLeft.style.backgroundColor = getRandomRGBColor();
        fireworkLeft.style.boxShadow = `0 0 15px 5px ${getRandomRGBColor()}`;
        fireworksContainer.appendChild(fireworkLeft);

        animateFirework(fireworkLeft, true);

        const fireworkRight = document.createElement("div");
        fireworkRight.classList.add("firework");
        fireworkRight.style.backgroundColor = getRandomRGBColor();
        fireworkRight.style.boxShadow = `0 0 15px 5px ${getRandomRGBColor()}`;
        fireworksContainer.appendChild(fireworkRight);

        animateFirework(fireworkRight, false);
      }
    }

    launchFireworksRound();

    setTimeout(() => {
      launchFireworksRound();
    }, 2000);

    setTimeout(() => {
      h1Element.classList.add("hover");
    }, 500);

    setTimeout(() => {
      fireworksContainer.style.display = "none";
      while (fireworksContainer.firstChild) {
        fireworksContainer.removeChild(fireworksContainer.firstChild);
      }
      h1Element.classList.remove("hover");
      h1Element.innerText = originalText;
      h1Element.setAttribute("data-text", originalText);
    }, 5000);
  }

  function animateFirework(firework, isLeft) {
    const animationDuration = 1.5 + Math.random() * 0.5;
    const randomHeight = 400 + Math.random() * 300;
    const screenWidth = window.innerWidth;

    const centerStart = screenWidth * 0.3;
    const centerEnd = screenWidth * 0.7;
    const targetLeft = Math.random() * (centerEnd - centerStart) + centerStart;

    const tiltOffset = (Math.random() - 0.5) * 100;

    firework.style.position = "absolute";
    firework.style.bottom = "0px";
    firework.style.left = isLeft
      ? `${Math.random() * 20}vw`
      : `${80 + Math.random() * 20}vw`;

    setTimeout(() => {
      firework.style.transition = `all ${animationDuration}s ease-out`;
      firework.style.bottom = `${randomHeight}px`;
      firework.style.left = `${targetLeft + tiltOffset}px`;
    }, 50);

    setTimeout(() => {
      const fireworkRect = firework.getBoundingClientRect();
      createExplosion(fireworkRect.left, fireworkRect.top);

      if (firework.parentNode) {
        firework.parentNode.removeChild(firework);
      }
    }, animationDuration * 1000);
  }

  function createExplosion(apexLeft, apexTop) {
    const fireworksContainer = document.getElementById("fireworks-container");

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.classList.add("firework-particle");

      particle.style.left = `${apexLeft}px`;
      particle.style.top = `${apexTop}px`;

      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 100 - 50;

      particle.style.setProperty("--particle-x", `${randomX}px`);
      particle.style.setProperty("--particle-y", `${randomY}px`);

      particle.style.backgroundColor = getRandomRGBColor();
      particle.style.boxShadow = `0 0 10px 5px ${getRandomRGBColor()}`;

      fireworksContainer.appendChild(particle);

      particle.addEventListener("animationend", () => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      });
    }
  }

  function getRandomRGBColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function addToOwnedAnimals(animal) {
    let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];
    const alreadyOwned = ownedAnimals.some(
      (ownedAnimal) => ownedAnimal.name === animal.name
    );

    if (!alreadyOwned) {
      ownedAnimals.push(animal);
      localStorage.setItem("ownedAnimals", JSON.stringify(ownedAnimals));
    } else {
    }
  }

  function getRandomAnimal() {
    const random = Math.random();
    if (random < 0.05) {
      const specialRewards = shopAnimals.filter((animal) =>
        ["MSeer", "VandaJ", "YenguiK", "PamstIr"].includes(animal.name)
      );
      return specialRewards[Math.floor(Math.random() * specialRewards.length)];
    } else {
      return shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
    }
  }
  function animateSlot(slot, selectedAnimal, callback) {
    const spinningDuration = 3000 + Math.random() * 1000; // Random spinning duration (3-4 seconds)
    const spinSpeed = 50; // Initial speed of spinning
    const slowdownRate = 1.05; // Slowdown multiplier

    let currentSpeed = spinSpeed;
    let startTime = Date.now();

    // Create a container to hold all spinning items
    const reel = document.createElement("div");
    reel.style.position = "relative";
    reel.style.top = "0";
    reel.style.transition = "top 0.1s linear";
    slot.appendChild(reel);

    // Add initial spinning items to the reel
    for (let i = 0; i < 20; i++) {
      const slotItem = document.createElement("div");
      slotItem.classList.add("slot-item");
      const randomAnimal =
        shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
      slotItem.innerHTML = `<img src="${randomAnimal.img}" alt="${randomAnimal.name}" style="width: 80px; height: 80px;">`;
      reel.appendChild(slotItem);
    }

    function spin() {
      const elapsedTime = Date.now() - startTime;

      // If the spinning duration is over, stop and show the selected animal
      if (elapsedTime >= spinningDuration) {
        // Stop the reel and display the selected animal
        reel.innerHTML = ""; // Clear spinning items
        const finalItem = document.createElement("div");
        finalItem.classList.add("slot-item");
        finalItem.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}" style="width: 80px; height: 80px;">`;
        slot.appendChild(finalItem);
        if (callback) callback();
        return;
      }

      // Simulate spinning by moving the reel upwards
      reel.style.top = `${parseInt(reel.style.top) - 100}px`;

      // Reset the reel's position and add new random animals when it scrolls too far
      if (parseInt(reel.style.top) <= -2000) {
        reel.style.top = "0";
        for (let i = 0; i < 5; i++) {
          const slotItem = document.createElement("div");
          slotItem.classList.add("slot-item");
          const randomAnimal =
            shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
          slotItem.innerHTML = `<img src="${randomAnimal.img}" alt="${randomAnimal.name}" style="width: 80px; height: 80px;">`;
          reel.appendChild(slotItem);
        }
      }

      // Gradually increase the time between spins to simulate slowing down
      currentSpeed *= slowdownRate;

      // Schedule the next spin
      setTimeout(spin, currentSpeed);
    }

    spin();
  }

  const backgroundAudio = new Audio(
    "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
  );
  backgroundAudio.volume = 0.08;
  backgroundAudio.loop = true;
  const savedTime = localStorage.getItem("backgroundAudioTime");
  if (savedTime) {
    backgroundAudio.currentTime = parseFloat(savedTime);
  }
  function spinColumn(column, finalAnimal, callback) {
    const reel = document.createElement("div");
    reel.style.position = "absolute";
    reel.style.top = "0";
    column.innerHTML = ""; // Clear the column
    column.appendChild(reel);

    // Add initial spinning items to the reel
    for (let i = 0; i < 20; i++) {
      const slotItem = document.createElement("div");
      slotItem.classList.add("slot-item");
      const randomAnimal =
        shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
      slotItem.innerHTML = `<img src="${randomAnimal.img}" alt="${randomAnimal.name}" style="width: 80px; height: 80px;">`;
      reel.appendChild(slotItem);
    }

    // Final item (the one that will be visible when spinning stops)
    const finalSlotItem = document.createElement("div");
    finalSlotItem.classList.add("slot-item");
    finalSlotItem.innerHTML = `<img src="${finalAnimal.img}" alt="${finalAnimal.name}" style="width: 80px; height: 80px;">`;
    reel.appendChild(finalSlotItem);

    // Animate the spinning reel
    let position = 0;
    const spinInterval = setInterval(() => {
      position -= 100; // Move reel upwards
      reel.style.transform = `translateY(${position}px)`;

      // Stop spinning after reaching the final item
      if (position <= -2000) {
        clearInterval(spinInterval);
        reel.style.transform = `translateY(-200px)`; // Show the final item
        callback(); // Notify that spinning is complete
      }
    }, 50);
  }

  const playBackgroundAudio = () => {
    backgroundAudio.play();
    document.removeEventListener("click", playBackgroundAudio);
    document.removeEventListener("keydown", playBackgroundAudio);
    document.removeEventListener("mousemove", playBackgroundAudio);
    document.removeEventListener("scroll", playBackgroundAudio);
    document.removeEventListener("touchstart", playBackgroundAudio);
    document.removeEventListener("focus", playBackgroundAudio);
    document.removeEventListener("mousedown", playBackgroundAudio);
    document.removeEventListener("mouseup", playBackgroundAudio);
  };

  document.addEventListener("click", playBackgroundAudio);
  document.addEventListener("keydown", playBackgroundAudio);
  document.addEventListener("mousemove", playBackgroundAudio);
  document.addEventListener("scroll", playBackgroundAudio);
  document.addEventListener("touchstart", playBackgroundAudio);
  document.addEventListener("focus", playBackgroundAudio);
  document.addEventListener("mousedown", playBackgroundAudio);
  document.addEventListener("mouseup", playBackgroundAudio);
});
