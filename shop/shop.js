document.addEventListener("DOMContentLoaded", function () {
  const specialAnimals = ["VJanda", "MSeer", "eagSVle", "PamstIr", "YenguiK"];
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
  coinsDisplay.style.top = "1.75rem";
  coinsDisplay.style.right = "9.375rem";
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
      generateCards(shopAnimals); // Generate cards after loading data
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

      // Set a custom property for the background color
      const color = animal.color;
      card.style.setProperty('--animal-color', color);

      // Add a class to enable the gradient animation on hover
      card.classList.add("gradient-hover");

      // Check if the animal is already owned and mark as sold out
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
      console.log(animalName);
      const animalImage = this.querySelector("img").src;
      let ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
      if (ownedAnimals.some((animal) => animal.name === animalName)) {
        alert("You already own this animal!");
        return;
      }

      // Reset the modal to its default state
      const h3 = document.getElementById("textext");
      h3.innerHTML = "Are you sure you want to buy this?";
      confirmButton.style.display = "inline-block"; // Ensure the confirm button is visible
      h3.style.textAlign = "center"; // Reset text alignment
      cancelButton.innerHTML = "Close"; // Reset cancel button text

      modalImage.src = animalImage;
      modal.setAttribute("data-animal", animalName);

      const animal = shopAnimals.find((a) => a.name === animalName); // Get animal details
      modal.setAttribute("data-price", animal.cost);
      document.getElementById(
        "modal-animal-price"
      ).textContent = `Price: ${animal.cost} Coins`;
      document.getElementById(
        "modal-animal-stats"
      ).textContent = `Attack: ${animal.attack}, Health: ${animal.health}`;

      // Special animal logic
      if (specialAnimals.includes(animalName)) {
        h3.innerHTML =
          "you cannot buy this animal, you can only get this animal through gacha";
        confirmButton.style.display = "none"; // Hide the confirm button
        h3.style.textAlign = "center";
        cancelButton.innerHTML = "Close";
      }

      modal.style.display = "flex";
      modal.classList.add("show");
    });


      shopContainer.appendChild(card);
    });
  }
function showModal() {
  modal.style.display = "flex";
  modal.classList.add("show");
}
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
      markSoldOut(animalName); // Mark the animal as sold out immediately
    } else {
      alert("You don't have enough coins to buy this animal!");
    }

    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 500);
  });
});
