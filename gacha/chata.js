let cheatCode = "";
const cheatSequences = {
  jaklingko: "500000 Coins",
  subcoc: "MSeer",
  subcojava: "YenguiK",
  subcodb: "VJanda",
  subcowd: "PamstIr",
  subcovis: "eagSVle",
};
let cheatActivated = false;
let cheatReward = "";
let cheatAnimal = "";

document.addEventListener("keydown", function (event) {
  cheatCode += event.key.toLowerCase();
  if (cheatCode.length > 10) {
    cheatCode = cheatCode.slice(1);
  }
  for (const [sequence, reward] of Object.entries(cheatSequences)) {
    if (cheatCode.endsWith(sequence)) {
      cheatActivated = true;
      if (sequence === "jaklingko") {
        cheatReward = reward;
        updateCoinsDisplay();
      } else {
        cheatAnimal = reward;
         cheatReward = reward;
      }
      break;
    }
  }
  if (cheatActivated && cheatReward) {
    showCheatModal(cheatReward);
    cheatActivated = false;
  }
});

function updateCoinsDisplay() {
  let coins = Number(localStorage.getItem("coins"));
  coins += 500000;
  localStorage.setItem("coins", coins);
  const coinsDisplay = document.getElementById("coinsDisplay");
  if (coinsDisplay) {
    coinsDisplay.textContent = `Coins: ${coins}`;
  }
}

const cheatModal = document.getElementById("cheat-modal");
const cheatText = document.getElementById("cheat-text");
const cheatRewardText = document.getElementById("cheat-reward");
function showCheatModal(reward) {
  cheatText.textContent = "Cheat Activated!";
  cheatRewardText.textContent = reward;
  cheatModal.style.display = "flex";
  setTimeout(() => {
    cheatModal.classList.add("show");
  }, 10);
  setTimeout(() => {
    cheatModal.classList.remove("show");
    cheatModal.classList.add("hide");
    setTimeout(() => {
      cheatModal.style.display = "none";
      cheatModal.classList.remove("hide");
      cheatActivated = false;
    }, 500);
  }, 1500);
}
