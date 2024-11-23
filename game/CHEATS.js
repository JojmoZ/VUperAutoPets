let userInput = ""; 
let cheatCode = ""; 
const targetSequenceCoins = "CUTCUTCUT";
const targetSequenceLives = "JANGANAMPAS";
let coinsa = parseInt(localStorage.getItem("gamecoins")) || 0;
function checkSequence() {
  if (userInput === targetSequenceCoins) {
    coinsa += 241241241;
    updateCoinsDisplay();
    userInput = ""; 
  } else if (userInput === targetSequenceLives) {
    lives = 3;
    localStorage.setItem("lives", lives);
    updateHeartsDisplay();
    userInput = ""; 
  } else if (
    userInput.length >
    Math.max(targetSequenceCoins.length, targetSequenceLives.length)
  ) {
    userInput = ""; 
  }
}

document.addEventListener("keydown", function (event) {
  
  userInput += event.key.toUpperCase();
  cheatCode += event.key.toLowerCase();

  
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
    coinsa += 241241241; 
    updateCoinsDisplay();
  } else if (cheatCode.endsWith("janganampas")) {
    lives = 3; 
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
