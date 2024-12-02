document.addEventListener("DOMContentLoaded", function () {
  localStorage.removeItem("ingame");
  const specialAnimals = ["VandaJ", "MSeer", "eagSVle", "PamstIr", "YenguiK"];
  if (!localStorage.getItem("coins")) {
    localStorage.setItem("coins", "15");
    localStorage.setItem("ownedAnimals", JSON.stringify([]));
  }
  const username = localStorage.getItem("username");
  const redeem = document.getElementById("redeem-btn");
  redeem.addEventListener("click", function () {
    let pendingCoins = parseInt(localStorage.getItem("pendingCoins")) || 0;
    if (pendingCoins > 0) {
      let currentCoins = parseInt(localStorage.getItem("coins")) || 0;
      currentCoins += pendingCoins;

      localStorage.setItem("coins", currentCoins);
      localStorage.setItem("pendingCoins", 0);
      ShowModal(`You've earned ${pendingCoins} coins!`);
    }
  });
  const cards = document.querySelectorAll(".card");
  const modal = document.getElementById("modal");
  const modalImage = document.getElementById("modal-animal-image");
  const confirmButton = document.getElementById("confirm-buy");
  const cancelButton = document.getElementById("cancel-buy");
  const coinsDisplay = document.createElement("div");
  const coinImg = document.createElement("img");
  coinImg.src = "../assets/game-asset/Gold.png";
  coinImg.style.width = "3rem";
  coinImg.style.height = "3rem";
  coinImg.style.position = "fixed";
  coinImg.style.top = "25px";
  coinImg.style.right = "8rem";
  coinImg.style.zIndex = "9999";
  document.body.appendChild(coinImg);
  coinsDisplay.id = "coinsDisplay";
  coinsDisplay.style.fontFamily = "VUper";
  coinsDisplay.style.position = "fixed";
  coinsDisplay.style.top = "30px";
  coinsDisplay.style.right = "14rem";
  coinsDisplay.style.color = "white";
  coinsDisplay.style.fontSize = "2rem";
  coinsDisplay.style.zIndex = "9999";
  document.body.appendChild(coinsDisplay);
  const backbtn = document.getElementById("backArrow");
  backbtn.addEventListener("click", function () {
    window.location = "/menu/menu.html";
  });
  const shopContainer = document.querySelector(".shop-container");
  const scrollBar = document.getElementById("scroll-bar");

  function arrangeCardsInAlternatingPattern() {
    const cards = Array.from(
      document.querySelectorAll(".shop-container .card")
    );
    cards.forEach((card, index) => {
      const row = (index % 2) + 1;
      const col = Math.floor(index / 2) + 1;
      card.style.gridRowStart = row;
      card.style.gridColumnStart = col;
    });
  }

  arrangeCardsInAlternatingPattern();

  let isScrolling = false;
  let scrollAmount = 0;
  let lastScrollLeft = 0;
  let animationFrame;

  shopContainer.addEventListener(
    "wheel",
    function (event) {
      if (event.deltaY !== 0 || event.deltaX !== 0) {
        event.preventDefault();
        scrollAmount += event.deltaY + event.deltaX;

        if (!isScrolling) {
          isScrolling = true;
          animationFrame = requestAnimationFrame(smoothScroll);
        }
      }
    },
    { passive: false }
  );

  function smoothScroll() {
    if (Math.abs(scrollAmount) > 0.5) {
      shopContainer.scrollLeft += scrollAmount;
      scrollAmount *= 0.85;

      const maxScroll = shopContainer.scrollWidth - window.innerWidth;
      const scrollLeft = shopContainer.scrollLeft;

      const clampedScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
      document.body.style.backgroundPosition = `${-clampedScroll}px top`;

      animationFrame = requestAnimationFrame(smoothScroll);
    } else {
      cancelAnimationFrame(animationFrame);
      isScrolling = false;
    }
  }

  shopContainer.addEventListener("scroll", function () {
    const maxScrollLeft = shopContainer.scrollWidth - shopContainer.clientWidth;
    const scrollPercentage = (shopContainer.scrollLeft / maxScrollLeft) * 100;
    scrollBar.value = scrollPercentage;
  });

  scrollBar.addEventListener("input", function () {
    const maxScrollLeft = shopContainer.scrollWidth - shopContainer.clientWidth;
    const scrollLeft = (scrollBar.value / 100) * maxScrollLeft;
    shopContainer.scrollLeft = scrollLeft;
  });

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
      generateCards(shopAnimals);
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));

  function generateCards(animals) {
    const shopContainer = document.getElementById("shopContainer");

    animals.forEach((animal) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute("data-animal", animal.name);
      card.setAttribute("data-color", animal.color);

      const img = document.createElement("img");
      img.src = animal.img;
      img.alt = animal.name;

      const name = document.createElement("h3");
      name.textContent = animal.name;

      card.appendChild(img);
      card.appendChild(name);

      const color = animal.color;
      card.style.setProperty("--animal-color", color);
      card.classList.add("gradient-hover");

      let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
      if (
        ownedAnimals.some((ownedAnimal) => ownedAnimal.name === animal.name)
      ) {
        const soldOutOverlay = document.createElement("div");
        soldOutOverlay.classList.add("sold-out-overlay");
        soldOutOverlay.textContent = "Owned";
        card.appendChild(soldOutOverlay);
        card.classList.add("sold-out");
      }

      card.addEventListener("click", function () {
        const animalName = this.querySelector("h3").textContent;
        const animalImage = this.querySelector("img").src;
        let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
        if (ownedAnimals.some((animal) => animal.name === animalName)) {
          ShowModal("You already own this animal!");
          return;
        }

        const h3 = document.getElementById("textext");
        h3.innerHTML = "Are you sure you want to buy this?";
        confirmButton.style.display = "inline-block";
        h3.style.textAlign = "center";
        cancelButton.innerHTML = "Close";

        modalImage.src = animalImage;
        modal.setAttribute("data-animal", animalName);

        const animal = shopAnimals.find((a) => a.name === animalName);
        modal.setAttribute("data-price", animal.cost);
        document.getElementById(
          "modal-animal-price"
        ).textContent = `Price: ${animal.cost} Coins`;
        document.getElementById(
          "modal-animal-stats"
        ).textContent = `Attack: ${animal.attack}, Health: ${animal.health}`;

        const modalContent = document.querySelector(".modal-content");
        const nearColor = getNearColor(animal.color);
        modalContent.style.background = `linear-gradient(135deg, ${animal.color} 0%, ${nearColor} 100%)`;

        const imageContainer = document.querySelector(".image-container");
        const darkerColor = getDarkerColor(animal.color);
        imageContainer.style.setProperty("--animal-border-color", darkerColor);

        if (specialAnimals.includes(animalName)) {
          h3.innerHTML =
            "you cannot buy this animal, you can only get this animal through gacha";
          confirmButton.style.display = "none";
          h3.style.textAlign = "center";
          cancelButton.innerHTML = "Close";
        }

        modal.style.display = "flex";
        modal.classList.add("show");
      });

      shopContainer.appendChild(card);
    });
  }

  function getNearColor(color) {
    const colorMap = {
      "#ff0000": "#ff7f7f",
      "#00ff00": "#7fff7f",
      "#0000ff": "#7f7fff",
      "#ffff00": "#ffbf00",
      "#ff00ff": "#ff7fff",
      "#00ffff": "#7fffff",
      "#636363": "#8c8c8c",
      "#0594DB": "#5bb8e6",
      "#AB7B62": "#d1a48b",
      "#FF938F": "#ffb3b0",
      "#6C8C09": "#8fbf0c",
      "#B4BCBF": "#d1d8da",
      "#FF819E": "#ffb3c1",
      "#F09D61": "#f4b98d",
      "#8F999E": "#b3c1c6",
      "#A3735E": "#c49a85",
      "#D6A16F": "#e6c1a0",
      "#EB8760": "#f1a48b",
      "#CF4F4B": "#e67f7c",
      "#99593D": "#b37a5e",
      "#D9A46F": "#e6c1a0",
      "#707070": "#8c8c8c",
      "#676880": "#8c8ca0",
      "#868A91": "#a3a7af",
      "#FADDA9": "#fce6c1",
      "#A4C400": "#c1e600",
      "#8EA848": "#b3d16c",
      "#FFDE59": "#ffe680",
      "#766D78": "#a39aa3",
      "#B4D7E3": "#d1eaf1",
    };
    return colorMap[color] || "#ffffff";
  }

  function getDarkerColor(color) {
    const colorMap = {
      "#ff0000": "#b30000",
      "#00ff00": "#009900",
      "#0000ff": "#000099",
      "#ffff00": "#b3b300",
      "#ff00ff": "#b300b3",
      "#00ffff": "#009999",
      "#636363": "#3f3f3f",
      "#0594DB": "#036ba1",
      "#AB7B62": "#7a5644",
      "#FF938F": "#b36663",
      "#6C8C09": "#4a5e06",
      "#B4BCBF": "#7a8284",
      "#FF819E": "#b35a6e",
      "#F09D61": "#a36d44",
      "#8F999E": "#5f666a",
      "#A3735E": "#704f42",
      "#D6A16F": "#946b4b",
      "#EB8760": "#a35d42",
      "#CF4F4B": "#8f3533",
      "#99593D": "#663d2a",
      "#D9A46F": "#946b4b",
      "#707070": "#4d4d4d",
      "#676880": "#46465a",
      "#868A91": "#5c5f64",
      "#FADDA9": "#b39b73",
      "#A4C400": "#6e8a00",
      "#8EA848": "#5f7230",
      "#FFDE59": "#b3a040",
      "#766D78": "#4f4950",
      "#B4D7E3": "#7a9ba1",
    };
    return colorMap[color] || "#000000";
  }

  function updateCoinsDisplay() {
    const coins = localStorage.getItem("coins");
    coinsDisplay.textContent = `Coins: ${coins}`;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.username === username);
    if (userIndex !== -1) {
      users[userIndex].coins = parseInt(coins, 10);
      localStorage.setItem("users", JSON.stringify(users));
    }
  }
  updateCoinsDisplay();

  function playSound() {
    const audio = new Audio("../coins-135571.mp3");
    audio.volume = 0.2;
    audio.play();
  }

  function markSoldOut(animalName) {
    const animalCard = [...document.querySelectorAll(".card")].find(
      (card) => card.querySelector("h3").textContent === animalName
    );
    if (animalCard) {
      const soldOutOverlay = document.createElement("div");
      soldOutOverlay.classList.add("sold-out-overlay");
      soldOutOverlay.textContent = "Owned";
      animalCard.appendChild(soldOutOverlay);
      animalCard.classList.add("sold-out");
    }
  }
  const gotoGacha = document.getElementById("gacha-btn");
  gotoGacha.addEventListener("click", function () {
    window.location = "/gacha/gachapage.html";
  });
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];
  ownedAnimals.forEach((animal) => {
    markSoldOut(animal.name);
  });

  cancelButton.addEventListener("click", function () {
    modal.classList.remove("show");
    modal.classList.add("hide");

    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("hide");
    }, 500);
  });
  confirmButton.addEventListener("click", function () {
    modal.classList.remove("show");
    modal.classList.add("hide");
    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("hide");
    }, 500);
  });
  confirmButton.addEventListener("click", function () {
    const animalName = modal.getAttribute("data-animal");
    const price = parseInt(modal.getAttribute("data-price"), 10);
    let coins = parseInt(localStorage.getItem("coins"), 10);
    let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];

    if (coins >= price) {
      const animal = shopAnimals.find((a) => a.name === animalName);
      coins -= price;
      ownedAnimals.push(animal);
      localStorage.setItem("coins", coins.toString());
      localStorage.setItem("ownedAnimals", JSON.stringify(ownedAnimals));
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex((user) => user.username === username);

      if (userIndex !== -1) {
        users[userIndex].coins = coins;
        users[userIndex].ownedAnimals = ownedAnimals;
        localStorage.setItem("users", JSON.stringify(users));
      }

      updateCoinsDisplay();
      playSound();
      markSoldOut(animalName);
    } else {
      ShowModal("You don't have enough coins to buy this animal!");
    }

    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 500);
  });

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

  window.addEventListener("beforeunload", () => {
    localStorage.setItem("backgroundAudioTime", backgroundAudio.currentTime);
  });

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      const animalName = card.getAttribute("data-animal").toLowerCase();
      if (animalName.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});
