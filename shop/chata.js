let shopAnimals = [];
window.onload = function () {
  fetch("../assets/shopAnimals.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      shopAnimals = data;
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));
};
let cheatCode = "";
const cheatSequences = {
  jaklingko: "500000 Coins",
  nuclear: "All Animals",
};
let cheatActivated = false;
let cheatReward = "";

document.addEventListener("keydown", function (event) {
  cheatCode += event.key.toLowerCase();
  if (cheatCode.length > 10) {
    cheatCode = cheatCode.slice(1);
  }
  for (const [sequence, reward] of Object.entries(cheatSequences)) {
    if (cheatCode.endsWith(sequence)) {
      cheatActivated = true;
      cheatReward = reward;
      if (sequence === "jaklingko") {
        updateCoinsDisplay();
      } else if (sequence === "nuclear") {
        giveAllAnimals();
      }
      break;
    }
  }
});

function updateCoinsDisplay() {
  console.log("aaa");
  let coins = Number(localStorage.getItem("coins"));
  coins += 500000;
  coinsDisplay.textContent = `Coins: ${coins}`;
  localStorage.setItem("coins", coins);
}

function giveAllAnimals() {
  localStorage.setItem("ownedAnimals", JSON.stringify(shopAnimals));
  alert("Cheat activated! You now own all animals.");
  updateOwnedAnimalsDisplay();
}

function updateOwnedAnimalsDisplay() {
  const ownedAnimals = JSON.parse(localStorage.getItem("ownedAnimals")) || [];
  ownedAnimals.forEach((animal) => {
    const animalCard = [...document.querySelectorAll(".card")].find(
      (card) => card.querySelector("h3").textContent === animal.name
    );
    if (animalCard && !animalCard.classList.contains("sold-out")) {
      const soldOutOverlay = document.createElement("div");
      soldOutOverlay.classList.add("sold-out-overlay");
      soldOutOverlay.textContent = "Owned";
      animalCard.appendChild(soldOutOverlay);
      animalCard.classList.add("sold-out");
    }
  });
}
