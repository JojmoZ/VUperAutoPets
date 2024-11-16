document.addEventListener("DOMContentLoaded", function () {
  const lever = document.getElementById("lever");
  const gachaResult = document.getElementById("gachaResult");
  const slot1 = document.getElementById("slot1");
  const slot2 = document.getElementById("slot2");
  const slot3 = document.getElementById("slot3");
  const h1Element = document.querySelector("h1[data-text='Try Your Luck!']");
  let shopAnimals = [];

  // Load shop animals from JSON
  fetch("../assets/shopAnimals.json")
    .then((response) => response.json())
    .then((data) => {
      shopAnimals = data;
      console.log("shopAnimals loaded:", shopAnimals);
    })
    .catch((error) => console.error("Error loading shopAnimals:", error));

  let cheatCode = "";
  const cheatSequences = {
    subcoc: "MSeer",
    subcojava: "YenguiK",
    subcodb: "VJanda",
    subcowd: "PamstIr",
    subcovis: "eagSVle",
  };
  let cheatActivated = false;
  let cheatAnimal = "";
  let isRolling = false;

  document.addEventListener("keydown", function (event) {
    cheatCode += event.key;
    if (cheatCode.length > 10) {
      cheatCode = cheatCode.slice(1);
    }
    for (const [sequence, animal] of Object.entries(cheatSequences)) {
      if (cheatCode.endsWith(sequence)) {
        cheatActivated = true;
        cheatAnimal = animal;
        alert(`Cheat activated! Next roll will be ${animal}.`);
        break;
      }
    }
  });

  lever.addEventListener("mousedown", function () {
    if (isRolling) return; // Prevent rolling if already rolling
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

    isRolling = true; // Set rolling flag

    // Clear previous results before starting new animation
    slot1.innerHTML = "";
    slot2.innerHTML = "";
    slot3.innerHTML = "";

    let selectedAnimal1, selectedAnimal2, selectedAnimal3;

    if (cheatActivated) {
      const cheatAnimalObj = shopAnimals.find(
        (animal) => animal.name === cheatAnimal
      );
      selectedAnimal1 = selectedAnimal2 = selectedAnimal3 = cheatAnimalObj;
      cheatActivated = false; // Reset cheat
    } else {
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
    }

    animateSlot(slot1, selectedAnimal1, () => {
      animateSlot(slot2, selectedAnimal2, () => {
        animateSlot(slot3, selectedAnimal3, () => {
          isRolling = false; // Reset rolling flag after animation completes
          setTimeout(() => {
            checkThreeOfAKind(selectedAnimal1, selectedAnimal2, selectedAnimal3);
          }, 100); // Delay to ensure slot3 result is displayed
        });
      });
    });

    localStorage.setItem("coins", (coins - 5).toString()); // Deduct coins
  }

  function checkThreeOfAKind(animal1, animal2, animal3) {
    if (animal1.name === animal2.name && animal2.name === animal3.name) {
      // alert(`Congratulations! You got three ${animal1.name}s!`);
      addToOwnedAnimals(animal1);
      showFireworks(); // Show fireworks on win
    }
  }

function showFireworks() {
  const fireworksContainer = document.getElementById("fireworks-container");
  const originalText = h1Element.innerText;
  h1Element.innerText = "YOU WIN!";
  h1Element.setAttribute("data-text", "YOU WIN!");
  fireworksContainer.style.display = "block";

  // Function to launch a single round of fireworks
  function launchFireworksRound() {
    for (let i = 0; i < 10; i++) {
      // Create firework from bottom-left
      const fireworkLeft = document.createElement("div");
      fireworkLeft.classList.add("firework");
      fireworkLeft.style.backgroundColor = getRandomRGBColor();
      fireworkLeft.style.boxShadow = `0 0 15px 5px ${getRandomRGBColor()}`;
      fireworksContainer.appendChild(fireworkLeft);

      // Animate from the bottom-left
      animateFirework(fireworkLeft, true);

      // Create firework from bottom-right
      const fireworkRight = document.createElement("div");
      fireworkRight.classList.add("firework");
      fireworkRight.style.backgroundColor = getRandomRGBColor();
      fireworkRight.style.boxShadow = `0 0 15px 5px ${getRandomRGBColor()}`;
      fireworksContainer.appendChild(fireworkRight);

      // Animate from the bottom-right
      animateFirework(fireworkRight, false);
    }
  }

  // Launch the first round of fireworks
  launchFireworksRound();

  // Launch the second round after a delay
  setTimeout(() => {
    launchFireworksRound();
  }, 2000); // Delay of 4 seconds between rounds

  // Trigger h1 hover effect once after 500 milliseconds
  setTimeout(() => {
    h1Element.classList.add("hover");
  }, 500);

  // Reset the fireworks container and stop hover effect after all rounds are done
  setTimeout(() => {
    fireworksContainer.style.display = "none";
    while (fireworksContainer.firstChild) {
      fireworksContainer.removeChild(fireworksContainer.firstChild);
    }
    h1Element.classList.remove("hover"); // Ensure hover effect is removed
    h1Element.innerText = originalText; // Reset text to original
    h1Element.setAttribute("data-text", originalText); // Reset data-text attribute to original
  }, 5000); // Adjust this to cover both rounds and their animations
}


function animateFirework(firework, isLeft) {
  const animationDuration = 1.5 + Math.random() * 0.5; // Duration between 1.5s and 2s
  const randomHeight = 400 + Math.random() * 300; // Random height between 400px and 700px
  const screenWidth = window.innerWidth;

  // Define the center region as a random range (e.g., middle 40% of the screen)
  const centerStart = screenWidth * 0.3; // 30% from the left
  const centerEnd = screenWidth * 0.7; // 70% from the left
  const targetLeft = Math.random() * (centerEnd - centerStart) + centerStart;

  // Add randomness to the diagonal tilt (e.g., how much it leans towards the center)
  const tiltOffset = (Math.random() - 0.5) * 100; // Random offset between -50 and 50 pixels

  // Set initial position explicitly
  firework.style.position = "absolute";
  firework.style.bottom = "0px"; // Start at the bottom
  firework.style.left = isLeft
    ? `${Math.random() * 20}vw` // Random position within 20vw on the left
    : `${80 + Math.random() * 20}vw`; // Random position within 20vw on the right

  // Animate to the apex diagonally with added randomness
  setTimeout(() => {
    firework.style.transition = `all ${animationDuration}s ease-out`;
    firework.style.bottom = `${randomHeight}px`; // Random climb height
    firework.style.left = `${targetLeft + tiltOffset}px`; // Randomly adjust the tilt
  }, 50); // Allow time for the DOM to render the initial position

  // Trigger explosion at the apex
  setTimeout(() => {
    const fireworkRect = firework.getBoundingClientRect();
    createExplosion(fireworkRect.left, fireworkRect.top);

    // Remove the firework element
    if (firework.parentNode) {
      firework.parentNode.removeChild(firework);
    }
  }, animationDuration * 1000); // Trigger after animation ends
}




function createExplosion(apexLeft, apexTop) {
  const fireworksContainer = document.getElementById("fireworks-container");

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement("div");
    particle.classList.add("firework-particle");

    // Position particle at the apex
    particle.style.left = `${apexLeft}px`;
    particle.style.top = `${apexTop}px`;

    // Randomly calculate explosion direction and distance
    const randomX = Math.random() * 100 - 50; // Random value between -50 and 50
    const randomY = Math.random() * 100 - 50; // Random value between -50 and 50

    // Use inline styles to set random transform for the explosion
    particle.style.setProperty("--particle-x", `${randomX}px`);
    particle.style.setProperty("--particle-y", `${randomY}px`);

    // Assign random colors
    particle.style.backgroundColor = getRandomRGBColor();
    particle.style.boxShadow = `0 0 10px 5px ${getRandomRGBColor()}`;

    // Append particle to container
    fireworksContainer.appendChild(particle);

    // Remove particle after animation ends
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
    const alreadyOwned = ownedAnimals.some((ownedAnimal) => ownedAnimal.name === animal.name);

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
