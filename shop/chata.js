let cheatCode = "";
const cheatSequences = {
  nguli: "500000 Coins",
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
      updateCoinsDisplay();
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
