document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("coins")) {
    localStorage.setItem("coins", "15");
    localStorage.setItem("ownedAnimals", JSON.stringify([]));
  }
  const username = localStorage.getItem("username");

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

  const shopContainer = document.querySelector(".shop-container");
  console.log("shopContainer:", shopContainer); // Debugging statement

  function arrangeCardsInAlternatingPattern() {
    const cards = Array.from(
      document.querySelectorAll(".shop-container .card")
    );
    cards.forEach((card, index) => {
      const row = (index % 2) + 1; // Alternates between row 1 and 2
      const col = Math.floor(index / 2) + 1; // Moves to the next column after every two items
      card.style.gridRowStart = row;
      card.style.gridColumnStart = col;
    });
  }

  // Call the function to arrange the cards
  arrangeCardsInAlternatingPattern();


    let isScrolling = false;
    let scrollAmount = 0;
    let lastScrollLeft = 0;
    let animationFrame;

    function smoothScroll() {
      if (Math.abs(scrollAmount) > 0.5) {
        shopContainer.scrollLeft += scrollAmount;
        scrollAmount *= 0.85; // Reduce the scroll amount gradually to create a smooth stopping effect
        animationFrame = requestAnimationFrame(smoothScroll);
      } else {
        cancelAnimationFrame(animationFrame);
        isScrolling = false;
      }
    }

    shopContainer.addEventListener(
      "wheel",
      function (event) {
        if (event.deltaY !== 0) {
          event.preventDefault();
          scrollAmount += event.deltaY; // Add delta to the scroll amount for continuous movement

          if (!isScrolling) {
            isScrolling = true;
            animationFrame = requestAnimationFrame(smoothScroll);
          }
        }
      },
      { passive: false }
    );

  let shopAnimals = [
    {
      name: "VUnt",
      attack: 2,
      health: 1,
      cost: 2,
      img: "../assets/Animals/VUnt.webp",
    },
    {
      name: "fiCM",
      attack: 2,
      health: 3,
      cost: 5,
      img: "../assets/Animals/fiCM.webp",
    },
    {
      name: "KAon",
      attack: 3,
      health: 4,
      cost: 7,
      img: "../assets/Animals/KAon.webp",
    },
    {
      name: "DJig",
      attack: 3,
      health: 1,
      cost: 3,
      img: "../assets/Animals/DJig.webp",
    },
    {
      name: "turGTle",
      attack: 1,
      health: 2,
      cost: 4,
      img: "../assets/Animals/turGTle.webp",
    },
    {
      name: "eLOphant",
      attack: 8,
      health: 7,
      cost: 5,
      img: "../assets/Animals/eLOphant.webp",
    },
    {
      name: "aCFolotl",
      attack: 2,
      health: 4,
      cost: 2,
      img: "../assets/Animals/aCFolotl.webp",
    },
    {
      name: "caKRbara",
      attack: 4,
      health: 6,
      cost: 3,
      img: "../assets/Animals/caKRbara.webp",
    },
    {
      name: "CWinchilla",
      attack: 2,
      health: 5,
      cost: 3,
      img: "../assets/Animals/CWinchilla.webp",
    },
    {
      name: "eagSVle",
      attack: 12,
      health: 8,
      cost: 10,
      img: "../assets/Animals/eagSVle.webp",
    },
    {
      name: "monKKey",
      attack: 6,
      health: 7,
      cost: 8,
      img: "../assets/Animals/monKKey.webp",
    },
    {
      name: "MSeer",
      attack: 6,
      health: 8,
      cost: 4,
      img: "../assets/Animals/MSeer.webp",
    },
    {
      name: "octoSFus",
      attack: 10,
      health: 10,
      cost: 15,
      img: "../assets/Animals/octoSFus.webp",
    },
    {
      name: "owLF",
      attack: 5,
      health: 4,
      cost: 7,
      img: "../assets/Animals/owLF.webp",
    },
    {
      name: "PamstIr",
      attack: 3,
      health: 5,
      cost: 2,
      img: "../assets/Animals/PamstIr.webp",
    },
    {
      name: "VJanda",
      attack: 7,
      health: 10,
      cost: 6,
      img: "../assets/Animals/VJanda.webp",
    },
    {
      name: "YenguiK",
      attack: 4,
      health: 6,
      cost: 6,
      img: "../assets/Animals/YenguiK.webp",
    },
    {
      name: "PPat",
      attack: 4,
      health: 6,
      cost: 4,
      img: "../assets/Animals/PPat.webp",
    },
    {
      name: "ZKug",
      attack: 5,
      health: 7,
      cost: 5,
      img: "../assets/Animals/ZKug.webp",
    },
    {
      name: "tXYrannosaurus",
      attack: 15,
      health: 18,
      cost: 20,
      img: "../assets/Animals/tXYrannosaurus.webp",
    },
    {
      name: "VrocodiLe",
      attack: 11,
      health: 15,
      cost: 12,
      img: "../assets/Animals/VrocodiLe.webp",
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

  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];
  ownedAnimals.forEach((animal) => {
    markSoldOut(animal.name);
  });

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      const animalName = this.querySelector("h3").textContent;
      const animalImage = this.querySelector("img").src;
      let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
      if (ownedAnimals.some((animal) => animal.name === animalName)) {
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
      alert("You don't have enough coins to buy this animal!");
    }

    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 500);
  });
});
