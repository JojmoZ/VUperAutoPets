let userInput = "";
const targetSequenceCoins = "CUTCUTCUT"; // Sequence for updating coins
const targetSequenceLives = "JANGANAMPAS"; // Sequence for refreshing lives

function checkSequence() {
  if (userInput === targetSequenceCoins) {
    coins = 241241241;
    updateCoinsDisplay();
    userInput = ""; 
  } else if (userInput === targetSequenceLives) {
    lives = 3; 
    localStorage.setItem("lives", lives);
    updateHeartsDisplay();
    userInput = ""; 
  } else if (
    userInput.length > targetSequenceCoins.length &&
    userInput.length > targetSequenceLives.length
  ) {
    userInput = ""; 
  }
}
document.addEventListener("keydown", function (event) {
  userInput += event.key.toUpperCase();
  checkSequence();
});
function updateCoinsDisplay() {
  localStorage.setItem("gamecoins", coins);
  document.getElementById("coins").textContent = `Coins: ${coins}`;
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
