document.addEventListener("DOMContentLoaded", function () {
  localStorage.removeItem("ingame");
  // const path = window.electron.path;
  // const appDir = window.electron.__dirname;
  const lever = document.getElementById("lever");
  const columns = [
    document.getElementById("column1"),
    document.getElementById("column2"),
    document.getElementById("column3"),
  ];
  const gachaResult = document.getElementById("gachaResult");
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

      const animal =
        shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
      initialAnimals.push(animal);
      slotItem.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="width 195px; height 195px;">`;
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

    // const loginPath = path.join(appDir, "login/index.html");
    // window.location.href = `file://${loginPath}`;
    window.location.href = "/login/index.html";
  }

  const coinsDisplay = document.getElementById("coinsDisplay");
  const backBtn = document.getElementById("backArrow");
  backBtn.addEventListener("click", function () {
    // const shoppage = path.join(appDir, "shop/shoppage.html");
    // window.location.href = `file://${shoppage}`;
    window.location.href = "/shop/shoppage.html";
  });
  function updateCoinsDisplay() {
    const coins = parseInt(localStorage.getItem("coins"), 10);
    coinsDisplay.textContent = formatCoins(coins);
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.displayName === username);
    if (userIndex !== -1) {
      users[userIndex].coins = coins;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }
function formatCoins(coins) {
  if (coins >= 1000000) {
    return (coins / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (coins >= 1000) {
    // Use Math.floor to avoid rounding issues
    const value = Math.floor(coins / 100) / 10; // Keeps one decimal place without rounding up
    return value.toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return coins.toString();
  }
}




  updateCoinsDisplay();
  let rolling = false;
  const gachaSound = document.getElementById("gachaSound");
  const winSound = document.getElementById("winSound");
  lever.addEventListener("mousedown", function () {
    if (isRolling) return;
    isRolling = true;
    lever.style.transform = "translateY(10px)";
   
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
        let columnsFinished = 0;
        columns.forEach((column, index) => {
          setTimeout(() => {
            spinColumn(column, selectedAnimal, () => {
              columnsFinished++;
              if (columnsFinished === columns.length) {
                isRolling = false;
                gachaSound.pause(); // Stop the gacha sound after all columns finish spinning
                gachaSound.currentTime = 0; // Reset the sound to the beginning
                checkThreeOfAKind([
                  selectedAnimal,
                  selectedAnimal,
                  selectedAnimal,
                ]);
              }
            });
          }, index * 1000);
        });

        // localStorage.setItem(
        //   "coins",
        //   (localStorage.getItem("coins") - 5).toString()
        // );
        // updateCoinsDisplay();

        cheatAnimal = "";
        return true;
      }
    }
    console.log('a')
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
     if (handleCheatActivation()) {
       return;
     }
    const coins = parseInt(localStorage.getItem("coins"), 10);
    if (coins < 5) {
      ShowModal("You need at least 5 coins to play the Gacha!");
      isRolling = false; // Reset rolling state if not enough coins
      return;
    }
    gachaSound.loop = true;
    gachaSound.play();
   
    
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.displayName === username);
    if (userIndex !== -1) {
      if (!users[userIndex].pity) {
        users[userIndex].pity = 0;
      }
      users[userIndex].pity += 1;
      localStorage.setItem("users", JSON.stringify(users));
    }
   
    const columns = [
      document.getElementById("column1"),
      document.getElementById("column2"),
      document.getElementById("column3"),
    ];
 localStorage.setItem("coins", coins - 5);
 updateCoinsDisplay();
    const selectedAnimals = [];
    const random = Math.random();

    if (random < 0.05 || users[userIndex].pity >= 50) {
      users[userIndex].pity = 0;
      localStorage.setItem("users", JSON.stringify(users));
      const specialRewards = shopAnimals.filter((animal) =>
        ["MSeer", "VandaJ", "YenguiK", "PamstIr"].includes(animal.name)
      );
      const rareAnimal =
        specialRewards[Math.floor(Math.random() * specialRewards.length)];
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(rareAnimal);
      }
    } else if (random < 0.3) {
      const otherAnimals = shopAnimals.filter(
        (animal) =>
          !["MSeer", "VandaJ", "YenguiK", "PamstIr"].includes(animal.name)
      );
       const animalyes = otherAnimals[Math.floor(Math.random() * otherAnimals.length)];
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(animalyes  );
      }
    } else {
      for (let i = 0; i < 3; i++) {
        selectedAnimals.push(
          shopAnimals[Math.floor(Math.random() * shopAnimals.length)]
        );
      }
    }

    let columnsFinished = 0;

    columns.forEach((column, index) => {
      populateColumn(column, selectedAnimals[index]);
      setTimeout(() => {
        spinColumn(column, selectedAnimals[index], () => {
          columnsFinished++;
          if (columnsFinished === columns.length) {
            isRolling = false;
            gachaSound.pause(); // Stop the gacha sound after all columns finish spinning
            gachaSound.currentTime = 0; // Reset the sound to the beginning
            checkThreeOfAKind(selectedAnimals);
          }
        });
      }, index * 1000);
    });
  }

  function spinColumn(column, finalAnimal, callback) {
    console.log("Final Animal:", finalAnimal);
    column.innerHTML = "";
    const reel = document.createElement("div");
    reel.style.position = "relative";
    reel.style.top = "0px";
    column.appendChild(reel);

    const itemHeight = 195;
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

      slotItem.innerHTML = `<img src="${animal.img}" alt="${animal.name}" style="max-width: 10rem; max-height: 195px;aspect-ratio:1/1">`;
      reel.appendChild(slotItem);
    }

    const stopPosition = -(rowsAbove * itemHeight);
    let currentTop = 0;
    let spinSpeed = 30;
    let slowingDown = false;

    function spin() {
      if (
        !slowingDown &&
        Math.abs(currentTop - stopPosition) <= itemHeight * 5
      ) {
        slowingDown = true;
      }

      if (slowingDown) {
        spinSpeed = Math.max(2, spinSpeed * 0.97);
      }

      currentTop -= spinSpeed;
      reel.style.top = `${currentTop}px`;

      if (!slowingDown && currentTop <= -(totalRows * itemHeight)) {
        currentTop = 0;
      }

      if (
        slowingDown &&
        spinSpeed <= 2 &&
        Math.abs(currentTop - stopPosition) < 1
      ) {
        reel.style.top = `${stopPosition}px`;
        setTimeout(callback, 500);
        return;
      }

      requestAnimationFrame(spin);
    }

    spin();
  }
  const soundtroll = new Audio("../assets/sound/aw dangit.m4a");
  function checkThreeOfAKind(selectedAnimals) {
    if (
      selectedAnimals[0].name === selectedAnimals[1].name &&
      selectedAnimals[1].name === selectedAnimals[2].name
    ) {
      addToOwnedAnimals(selectedAnimals[0]);
      showFireworks();
      winSound.play();
    }else{
        troll = Math.random() *100;
        if (troll < 0.01){
            soundtroll.play();
        }
    }
  }

  function showFireworks() {
    const fireworksContainer = document.getElementById("fireworks-container");
    const winImageContainer = document.getElementById("winImageContainer");
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block"; 
    fireworksContainer.style.display = "block";
    winImageContainer.style.display = "block"; 

    
    winImageContainer.style.animation = 'none';
    winImageContainer.offsetHeight; 
    winImageContainer.style.animation = null;

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
      fireworksContainer.style.display = "none";
      winImageContainer.classList.add("fade-out"); 
      setTimeout(() => {
        winImageContainer.style.display = "none"; 
        winImageContainer.classList.remove("fade-out"); 
        overlay.style.display = "none"; 
        while (fireworksContainer.firstChild) {
          fireworksContainer.removeChild(fireworksContainer.firstChild);
        }
        
        
        
      }, 500); 
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