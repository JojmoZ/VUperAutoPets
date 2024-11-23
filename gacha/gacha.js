document.addEventListener("DOMContentLoaded", function () {
  const lever = document.getElementById("lever");
  const gachaResult = document.getElementById("gachaResult");
  const slot1 = document.getElementById("slot1");
  const slot2 = document.getElementById("slot2");
  const slot3 = document.getElementById("slot3");
  const h1Element = document.querySelector("h1[data-text='Try Your Luck!']");
  let shopAnimals = [];
  const username = localStorage.getItem("username");
  fetch("../assets/shopAnimals.json")
    .then((response) => response.json())
    .then((data) => {
      shopAnimals = data;
      console.log("shopAnimals loaded:", shopAnimals);
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));

  let isRolling = false;

  const coinsDisplay = document.getElementById("coinsDisplay");

  function updateCoinsDisplay() {
    const coins = localStorage.getItem("coins");
    coinsDisplay.textContent = `Coins: ${coins}`;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.username === username);
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
      const userIndex = users.findIndex((user) => user.username === username);
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

    if (handleCheatActivation()) {
      localStorage.setItem("coins", (coins - 5).toString());
      updateCoinsDisplay();
      return;
    }

    slot1.innerHTML = "";
    slot2.innerHTML = "";
    slot3.innerHTML = "";

    let selectedAnimal1, selectedAnimal2, selectedAnimal3;

    const random = Math.random();
    if (random < 0.02) {
      const specialRewards = shopAnimals.filter((animal) =>
        ["MSeer", "VJanda", "YenguiK", "PamstIr"].includes(animal.name)
      );
      selectedAnimal1 =
        selectedAnimal2 =
        selectedAnimal3 =
          specialRewards[Math.floor(Math.random() * specialRewards.length)];
    } else if (random < 0.09) {
      const otherAnimals = shopAnimals.filter(
        (animal) =>
          !["MSeer", "VJanda", "YenguiK", "PamstIr"].includes(animal.name)
      );
      selectedAnimal1 =
        selectedAnimal2 =
        selectedAnimal3 =
          otherAnimals[Math.floor(Math.random() * otherAnimals.length)];
    } else {
      selectedAnimal1 = getRandomAnimal();
      selectedAnimal2 = getRandomAnimal();
      selectedAnimal3 = getRandomAnimal();
    }

    animateSlot(slot1, selectedAnimal1, () => {
      animateSlot(slot2, selectedAnimal2, () => {
        animateSlot(slot3, selectedAnimal3, () => {
          isRolling = false;
          gachaSound.pause();
          gachaSound.currentTime = 0;
          setTimeout(() => {
            checkThreeOfAKind(
              selectedAnimal1,
              selectedAnimal2,
              selectedAnimal3
            );
          }, 100);
        });
      });
    });

    localStorage.setItem("coins", (coins - 5).toString());
    updateCoinsDisplay();
  }

  function checkThreeOfAKind(animal1, animal2, animal3) {
    if (animal1.name === animal2.name && animal2.name === animal3.name) {
      addToOwnedAnimals(animal1);
      showFireworks();
      gachaSound.pause();
      gachaSound.currentTime = 0;
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
        ["MSeer", "VJanda", "YenguiK", "PamstIr"].includes(animal.name)
      );
      return specialRewards[Math.floor(Math.random() * specialRewards.length)];
    } else {
      return shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
    }
  }

  function animateSlot(slot, selectedAnimal, callback) {
    let index = 0;
    let speed = 50;
    const maxSpeed = 500;
    const slowdownRate = 1.05;
    const stopTime = 3000 + Math.random() * 1000;
    const startTime = Date.now();

    function spin() {
      const slotItem = document.createElement("div");
      slotItem.classList.add("slot-item");
      slotItem.style.transform = "translateY(-100%)";
      slotItem.innerHTML = `<img src="${shopAnimals[index].img}" alt="${shopAnimals[index].name}" style="width: 80px; height: 80px;">`;
      slot.appendChild(slotItem);

      setTimeout(() => {
        slotItem.style.transform = "translateY(100%)";
      }, 10);

      setTimeout(() => {
        if (slotItem.parentNode) slotItem.parentNode.removeChild(slotItem);
      }, speed + 200);

      index = (index + 1) % shopAnimals.length;
      speed *= slowdownRate;

      if (Date.now() - startTime >= stopTime) {
        slot.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}" style="width: 80px; height: 80px;">`;
        if (callback) callback();
      } else {
        setTimeout(spin, speed);
      }
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
