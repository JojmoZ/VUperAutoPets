document.addEventListener("DOMContentLoaded", function () {
  localStorage.removeItem("ingame");
  const lever = document.getElementById("lever");
  const columns = [
    document.getElementById("column1"),
    document.getElementById("column2"),
    document.getElementById("column3"),
  ];
  const gachaResult = document.getElementById("gachaResult");
  const h1Element = document.querySelector("h1[data-text='Try Your Luck!']");
  let shopAnimals = [];
  const username = localStorage.getItem("username");
  fetch("../assets/jsons/shopAnimals.json")
    .then((response) => response.json())
    .then((data) => {
      shopAnimals = data;
      populateInitialColumns();
      console.log("shopAnimals loaded:", shopAnimals);
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));

  let isRolling = false;
  const logged = localStorage.getItem("loggedin");
 function populateColumn(column) {
   const reel = document.createElement("div");
   reel.style.position = "relative";
   reel.style.top = "0px";
   column.appendChild(reel);

   const visibleSlots = 3; 
   const rowsAbove = 12; 
   const rowsBelow = 6; 
   const totalRows = rowsAbove + visibleSlots + rowsBelow;

   column.dataset.initialAnimals = JSON.stringify([]); 
   const initialAnimals = [];

   for (let i = 0; i < totalRows; i++) {
     const slotItem = document.createElement("div");
     slotItem.classList.add("slot-item");

     const animal = shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
     initialAnimals.push(animal);
     slotItem.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="width 167px; height 167px;">`;
     reel.appendChild(slotItem);
   }

   column.dataset.initialAnimals = JSON.stringify(initialAnimals); 
 }

 function populateInitialColumns() {
   columns.forEach((column) => populateColumn(column));
 }

  if (!logged) {
    function clearLocalStorageExceptUsers() {
      const keysToKeep = ["users"];

      const allKeys = Object.keys(localStorage);

      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }

    clearLocalStorageExceptUsers();

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
      const columns = [
        document.getElementById("column1"),
        document.getElementById("column2"),
        document.getElementById("column3"),
      ];
      columns.forEach((column, index) => {
        setTimeout(() => {
          spinColumn(column, selectedAnimal, () => {
            if (index === columns.length - 1) {
              isRolling = false;
              checkThreeOfAKind([
                selectedAnimal,
                selectedAnimal,
                selectedAnimal,
              ]);
            }
          });
        }, index * 1000);
      });

      localStorage.setItem(
        "coins",
        (localStorage.getItem("coins") - 5).toString()
      );
      updateCoinsDisplay();

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

    localStorage.setItem("coins", coins - 5);
    updateCoinsDisplay();
  if (handleCheatActivation()) {
    return; 
  }
    const columns = [
      document.getElementById("column1"),
      document.getElementById("column2"),
      document.getElementById("column3"),
    ];

    const selectedAnimals = [];
    const random = Math.random();

    if (random < 0.02) {
      
      const specialRewards = shopAnimals.filter((animal) =>
        ["MSeer", "VandaJ", "YenguiK", "PamstIr"].includes(animal.name)
      );
      const rareAnimal =
        specialRewards[Math.floor(Math.random() * specialRewards.length)];
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(rareAnimal);
      }
    } else {
      
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(
          shopAnimals[Math.floor(Math.random() * shopAnimals.length)]
        );
      }
    }

    
    columns.forEach((column, index) => {
      populateColumn(column, selectedAnimals[index]);
      setTimeout(() => {
        spinColumn(column, selectedAnimals[index], () => {
          if (index === columns.length - 1) {
            isRolling = false;
            checkThreeOfAKind(selectedAnimals);
          }
        });
      }, index * 1000); 
    });
  }

function spinColumn(column, finalAnimal, callback) {
  console.log(finalAnimal);
  column.innerHTML = "";
  const reel = document.createElement("div");
  reel.style.position = "relative";
  reel.style.top = "0px";
  column.appendChild(reel);

  const itemHeight = 167; 
  const visibleSlots = 3; 
  const rowsAbove = 24; 
  const rowsBelow = 6; 
  const totalRows = rowsAbove + visibleSlots + rowsBelow;

  
  for (let i = 0; i < totalRows; i++) {
    const slotItem = document.createElement("div");
    slotItem.classList.add("slot-item");

    const animal =
      i === rowsAbove + Math.floor(visibleSlots / 2)
        ? finalAnimal 
        : shopAnimals[Math.floor(Math.random() * shopAnimals.length)];

    slotItem.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="width: 167px; height: 167px;">`;
    reel.appendChild(slotItem);
  }

  
  const stopPosition = -(rowsAbove * itemHeight) + 167; 
  let currentTop = 0; 
  let spinSpeed = 60; 
  const slowDownRate = 1.01; 
  const stopThreshold = 200; 

  const easingDuration = 500; 
  let easingStart = false;

  function spin() {
    if (!easingStart && Math.abs(currentTop - stopPosition) <= stopThreshold) {
      
      easingStart = true;
      const startPosition = currentTop;
      const startTime = Date.now();

      function easeToStop() {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= easingDuration) {
          reel.style.top = `${stopPosition}px`; 
          setTimeout(callback, 500); 
        } else {
          const easingProgress = elapsedTime / easingDuration;
          const easedTop =
            startPosition + (stopPosition - startPosition) * easingProgress;
          reel.style.top = `${easedTop}px`;
          requestAnimationFrame(easeToStop);
        }
      }

      easeToStop();
      return;
    }

    
    currentTop -= spinSpeed;
    reel.style.top = `${currentTop}px`;

    
    if (currentTop <= -(totalRows * itemHeight)) {
      currentTop = 0;
    }

    
    if (!easingStart) {
      spinSpeed = Math.max(2, spinSpeed * slowDownRate); 
    }

    requestAnimationFrame(spin);
  }

  spin();
}





  function checkThreeOfAKind(selectedAnimals) {
    if (
      selectedAnimals[0].name === selectedAnimals[1].name &&
      selectedAnimals[1].name === selectedAnimals[2].name
    ) {
      addToOwnedAnimals(selectedAnimals[0]);
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


  const backgroundAudio = new Audio(
    "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
  );
   const savedVolume = localStorage.getItem("backgroundAudioVolume");
   if (savedVolume !== null) {
     backgroundAudio.volume = parseFloat(savedVolume);
   } else {
     backgroundAudio.volume = 0.1;
   }
  backgroundAudio.loop = true;
  const savedTime = localStorage.getItem("backgroundAudioTime");
  if (savedTime) {
    backgroundAudio.currentTime = parseFloat(savedTime);
  }
window.addEventListener("beforeunload", () => {
  localStorage.setItem("backgroundAudioTime", backgroundAudio.currentTime);
});
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
