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

      // Set the modal background color to the animal color and a near color
      const modalContent = document.querySelector(".modal-content");
      const nearColor = getNearColor(animal.color);
      modalContent.style.background = `linear-gradient(135deg, ${animal.color} 0%, ${nearColor} 100%)`;

      // Set the border color of the image container to a darker shade of the animal color
      const imageContainer = document.querySelector(".image-container");
      const darkerColor = getDarkerColor(animal.color);
      imageContainer.style.setProperty('--animal-border-color', darkerColor);

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

  function getNearColor(color) {
    // Function to get a near color for the gradient
    const colorMap = {
      "#ff0000": "#ff7f7f", // Red to light red
      "#00ff00": "#7fff7f", // Green to light green
      "#0000ff": "#7f7fff", // Blue to light blue
      "#ffff00": "#ffbf00", // Yellow to orange
      "#ff00ff": "#ff7fff", // Magenta to light magenta
      "#00ffff": "#7fffff", // Cyan to light cyan
      "#636363": "#8c8c8c", // Dark gray to light gray
      "#0594DB": "#5bb8e6", // Blue to light blue
      "#AB7B62": "#d1a48b", // Brown to light brown
      "#FF938F": "#ffb3b0", // Light red to lighter red
      "#6C8C09": "#8fbf0c", // Green to light green
      "#B4BCBF": "#d1d8da", // Light gray to lighter gray
      "#FF819E": "#ffb3c1", // Pink to light pink
      "#F09D61": "#f4b98d", // Orange to light orange
      "#8F999E": "#b3c1c6", // Gray to light gray
      "#A3735E": "#c49a85", // Brown to light brown
      "#D6A16F": "#e6c1a0", // Light brown to lighter brown
      "#EB8760": "#f1a48b", // Orange to light orange
      "#CF4F4B": "#e67f7c", // Red to light red
      "#99593D": "#b37a5e", // Brown to light brown
      "#D9A46F": "#e6c1a0", // Light brown to lighter brown
      "#707070": "#8c8c8c", // Dark gray to light gray
      "#676880": "#8c8ca0", // Dark blue to light blue
      "#868A91": "#a3a7af", // Gray to light gray
      "#FADDA9": "#fce6c1", // Light yellow to lighter yellow
      "#A4C400": "#c1e600", // Green to light green
      "#8EA848": "#b3d16c", // Green to light green
      "#FFDE59": "#ffe680", // Yellow to light yellow
      "#766D78": "#a39aa3", // Gray to light gray
      "#B4D7E3": "#d1eaf1", // Light blue to lighter blue
    };
    return colorMap[color] || "#ffffff"; // Default to white if no mapping found
  }

  function getDarkerColor(color) {
    // Function to get a darker shade of the color
    const colorMap = {
      "#ff0000": "#b30000", // Red to dark red
      "#00ff00": "#009900", // Green to dark green
      "#0000ff": "#000099", // Blue to dark blue
      "#ffff00": "#b3b300", // Yellow to dark yellow
      "#ff00ff": "#b300b3", // Magenta to dark magenta
      "#00ffff": "#009999", // Cyan to dark cyan
      "#636363": "#3f3f3f", // Dark gray to darker gray
      "#0594DB": "#036ba1", // Blue to dark blue
      "#AB7B62": "#7a5644", // Brown to dark brown
      "#FF938F": "#b36663", // Light red to dark red
      "#6C8C09": "#4a5e06", // Green to dark green
      "#B4BCBF": "#7a8284", // Light gray to dark gray
      "#FF819E": "#b35a6e", // Pink to dark pink
      "#F09D61": "#a36d44", // Orange to dark orange
      "#8F999E": "#5f666a", // Gray to dark gray
      "#A3735E": "#704f42", // Brown to dark brown
      "#D6A16F": "#946b4b", // Light brown to dark brown
      "#EB8760": "#a35d42", // Orange to dark orange
      "#CF4F4B": "#8f3533", // Red to dark red
      "#99593D": "#663d2a", // Brown to dark brown
      "#D9A46F": "#946b4b", // Light brown to dark brown
      "#707070": "#4d4d4d", // Dark gray to darker gray
      "#676880": "#46465a", // Dark blue to darker blue
      "#868A91": "#5c5f64", // Gray to dark gray
      "#FADDA9": "#b39b73", // Light yellow to dark yellow
      "#A4C400": "#6e8a00", // Green to dark green
      "#8EA848": "#5f7230", // Green to dark green
      "#FFDE59": "#b3a040", // Yellow to dark yellow
      "#766D78": "#4f4950", // Gray to dark gray
      "#B4D7E3": "#7a9ba1", // Light blue to dark blue
    };
    return colorMap[color] || "#000000"; // Default to black if no mapping found
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
