let userInput = "";
const targetSequenceCoins = "NGULI";

function checkSequence() {
  if (userInput === targetSequenceCoins) {
    updateCoinsDisplay();
    userInput = "";
  
  } else if (
    userInput.length > targetSequenceCoins.length
  ) {
    userInput = "";
  }
}
document.addEventListener("keydown", function (event) {
  userInput += event.key.toUpperCase();
  checkSequence();
});
function updateCoinsDisplay() {
    console.log("aaa")
  let coins = Number(localStorage.getItem("coins"));
  coins+=500000;
  coinsDisplay.textContent = `Coins: ${coins}`;
  localStorage.setItem("coins", coins);
}
