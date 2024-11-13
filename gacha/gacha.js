document.addEventListener("DOMContentLoaded", function () {
  const lever = document.getElementById("lever");
  const gachaResult = document.getElementById("gachaResult");
  const slot1 = document.getElementById("slot1");
  const slot2 = document.getElementById("slot2");
  const slot3 = document.getElementById("slot3");

  let shopAnimals = [];

  // Load shop animals from JSON
  fetch("../assets/shopAnimals.json")
    .then((response) => response.json())
    .then((data) => {
      shopAnimals = data;
      console.log("shopAnimals loaded:", shopAnimals);
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));

  lever.addEventListener("mousedown", function () {
    lever.style.transform = "translateY(100px)"; // Lever down animation
    setTimeout(() => {
      pullHandle();
    }, 500);
  });

  document.addEventListener("mouseup", function () {
    lever.style.transform = "translateY(0)"; // Reset lever after pull
  });

  function pullHandle() {
    const coins = parseInt(localStorage.getItem("coins"), 10);
    if (coins < 5) {
      alert("You need at least 5 coins to play the Gacha!");
      return;
    }

    const selectedAnimal1 = getRandomAnimal();
    const selectedAnimal2 = getRandomAnimal();
    const selectedAnimal3 = getRandomAnimal();

    animateSlot(slot1, selectedAnimal1, () => {
      animateSlot(slot2, selectedAnimal2, () => {
        animateSlot(slot3, selectedAnimal3);
      });
    });

    localStorage.setItem("coins", (coins - 5).toString()); // Deduct coins
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
    let speed = 50; // Initial speed of images moving down
    const maxSpeed = 500; // Maximum delay to slow down
    const slowdownRate = 1.05; // Rate at which the animation slows down
    const stopTime = 3000 + Math.random() * 1000; // Random end time for each slot
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

      // Remove the previous slot item after it moves down
      setTimeout(() => {
        if (slotItem.parentNode) slotItem.parentNode.removeChild(slotItem);
      }, speed + 200);

      index = (index + 1) % shopAnimals.length;
      speed *= slowdownRate; // Gradually increase interval (slows down)

      // Stop the slot on the selected animal after the stop time
      if (Date.now() - startTime >= stopTime) {
        slot.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}" style="width: 80px; height: 80px;">`;
        if (callback) callback(); // Move to the next slot
      } else {
        setTimeout(spin, speed); // Recursively call with the new slower speed
      }
    }

    spin(); // Start the recursive spinning
  }
});
