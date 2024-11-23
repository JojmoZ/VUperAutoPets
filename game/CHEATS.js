let userInput = ""; // For the original game-specific cheats
let cheatCode = ""; // For the new cheat-checking logic
const targetSequenceCoins = "CUTCUTCUT";
const targetSequenceLives = "JANGANAMPAS";
let coinsa = parseInt(localStorage.getItem("gamecoins")) || 0;
function checkSequence() {
  if (userInput === targetSequenceCoins) {
    coinsa += 241241241;
    updateCoinsDisplay();
    userInput = ""; // Reset input
  } else if (userInput === targetSequenceLives) {
    lives = 3;
    localStorage.setItem("lives", lives);
    updateHeartsDisplay();
    userInput = ""; // Reset input
  } else if (
    userInput.length >
    Math.max(targetSequenceCoins.length, targetSequenceLives.length)
  ) {
    userInput = ""; // Reset if too long and unmatched
  }
}

document.addEventListener("keydown", function (event) {
  // Add to both input mechanisms
  userInput += event.key.toUpperCase();
  cheatCode += event.key.toLowerCase();

  // Limit input lengths to avoid overflow
  if (
    userInput.length >
    Math.max(targetSequenceCoins.length, targetSequenceLives.length)
  ) {
    userInput = userInput.slice(1);
  }
  if (cheatCode.length > 10) {
    cheatCode = cheatCode.slice(1);
  }

  checkSequence();

  if (cheatCode.endsWith("cutcutcut")) {
    coinsa += 241241241; // Match the behavior of the `CUTCUTCUT` sequence
    updateCoinsDisplay();
  } else if (cheatCode.endsWith("janganampas")) {
    lives = 3; // Match the behavior of the `JANGANAMPAS` sequence
    localStorage.setItem("lives", lives);
    updateHeartsDisplay();
  }
});

function updateCoinsDisplay() {
  localStorage.setItem("gamecoins", coinsa);
  document.getElementById("coins").textContent = `Coins: ${coinsa}`;
}

function updateHeartsDisplay() {
  hearts.forEach((heart, index) => {
    if (index < lives) {
      heart.src = "../assets/heart.png";
    } else {
      heart.src = "../assets/broken heart.png";
    }
  });
}
