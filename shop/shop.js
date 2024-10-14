document.addEventListener("DOMContentLoaded", function () {
  
  if (!localStorage.getItem("coins")) {
    localStorage.setItem("coins", "15");
    localStorage.setItem("ownedAnimals", JSON.stringify([]));
  }
  const cards = document.querySelectorAll(".card");
  const modal = document.getElementById("modal");
  const modalImage = document.getElementById("modal-animal-image");
  const confirmButton = document.getElementById("confirm-buy");
  const cancelButton = document.getElementById("cancel-buy");
  const coinsDisplay = document.createElement("div");
  coinsDisplay.id = "coinsDisplay";
  coinsDisplay.style.position = "fixed";
  coinsDisplay.style.top = "25px";
  coinsDisplay.style.right = "150px";
  coinsDisplay.style.color = "white";
  coinsDisplay.style.fontSize = "20px";
  coinsDisplay.style.zIndex = "9999";
  document.body.appendChild(coinsDisplay);
let shopAnimals = [
  {
    name: "Ant",
    attack: 2,
    health: 1,
    cost: 2,
    star: 1,
    ability: "Faint: Give +2/+1 to a random ally",
    img: "../assets/Ant.webp",
  },
  {
    name: "Fish",
    attack: 2,
    health: 3,
    cost: 5,
    star: 2,
    ability: "Level-Up: Give all friends +1/+1",
    img: "../assets/Fish.webp",
  },
  {
    name: "Lion",
    attack: 3,
    health: 4,
    cost: 7,
    star: 3,
    ability: "Start of battle: Gain +3/+3 if you are the highest tier",
    img: "../assets/Lion.webp",
  },
  {
    name: "Pig",
    attack: 3,
    health: 1,
    cost: 3,
    star: 1,
    ability: "Sell: Gain +1 coin",
    img: "../assets/Pig.webp",
  },
  {
    name: "Turtle",
    attack: 1,
    health: 2,
    cost: 4,
    star: 2,
    ability: "Faint: Give friend behind Melon Armor",
    img: "../assets/Turtle.webp",
  },
  {
    name: "Elephant",
    attack: 8,
    health: 7,
    cost: 5,
    star: 4,
    ability: "Start of battle: Gain +3/+3 if you are the highest tier",
    img: "../assets/Elephant.webp",
  },
];
  function updateCoinsDisplay() {
    const coins = localStorage.getItem("coins");
    coinsDisplay.textContent = `Coins: ${coins}`;
  }
  updateCoinsDisplay();

  function playSound() {
    const audio = new Audio("../coins-135571.mp3");
    audio.play();
  }

  function markSoldOut(animalName) {
    const animalCard = [...cards].find(
      (card) => card.querySelector("h3").textContent === animalName
    );
    if (animalCard) {
      const soldOutOverlay = document.createElement("div");
      soldOutOverlay.classList.add("sold-out-overlay");
      soldOutOverlay.textContent = "Sold Out";
      animalCard.appendChild(soldOutOverlay);
      animalCard.classList.add("sold-out");
    }
  }

  // Mark sold out animals on page load
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];
  ownedAnimals.forEach((animal) => {
    markSoldOut(animal.name); // Use animal.name instead of just animal
  });


  cards.forEach((card) => {
    card.addEventListener("click", function () {
      const animalName = this.querySelector("h3").textContent;
      const animalImage = this.querySelector("img").src;
      let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
      if (ownedAnimals.includes(animalName)) {
        alert("You already own this animal!");
        return;
      }
      modalImage.src = animalImage;
      modal.setAttribute("data-animal", animalName);
      modal.setAttribute(
        "data-price",
        this.querySelector("p").textContent.match(/\d+/)[0]
      );
      modal.classList.add("show");
      modal.style.display = "flex";
    });
  });

  cancelButton.addEventListener("click", function () {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 500);
  });

  confirmButton.addEventListener("click", function () {
    const animalName = modal.getAttribute("data-animal");
    const price = parseInt(modal.getAttribute("data-price"), 10);
    let coins = parseInt(localStorage.getItem("coins"), 10);
    let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];

    if (coins >= price) {
      // Find the full animal object from shopAnimals
      const animal = shopAnimals.find((a) => a.name === animalName);

      // Deduct the price and store the full animal object in localStorage
      coins -= price;
      ownedAnimals.push(animal); // Store the full object instead of just the name
      localStorage.setItem("coins", coins.toString());
      localStorage.setItem("ownedAnimals", JSON.stringify(ownedAnimals));

      updateCoinsDisplay();
      playSound();
      markSoldOut(animalName); // Mark this animal as sold out on the page
    } else {
      alert("You don't have enough coins to buy this animal!");
    }

    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 500);
  });


});
