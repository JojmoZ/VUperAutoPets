let cheatCode = "";
const cheatSequences = {
  jaklingko: "500000 Coins",
  subcoc: "Your next reward is your SubCo A&DS!",
  subcojava: "Your next reward is your SubCo Java!",
  subcodb: "Your next reward is your SubCo DB!",
  subcowd: "Your next reward is your SubCo WD!",
  subcovis: "Your next reward is your SubCo COMVIS!",
};
let cheatActivated = false;
let cheatReward = "";
let cheatAnimal = "";
  const username = localStorage.getItem("username");
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

// function updateCoinsDisplay() {
//   let coins = Number(localStorage.getItem("coins"));
//   coins += 500000;
//   localStorage.setItem("coins", coins);
//   const coinsDisplay = document.getElementById("coinsDisplay");
//   if (coinsDisplay) {
//     coinsDisplay.textContent = `Coins: ${coins}`;
//   }
// }
  function updateCoinsDisplay() {
    const coins = parseInt(localStorage.getItem("coins"), 10);
    coinsDisplay.textContent = formatCoins(coins);
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.displayName === username);
    if (userIndex !== -1) {
      users[userIndex].coins = coins;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }
function addCoinsReward() {
  let coins = Number(localStorage.getItem("coins"));
  coins += 500000;
  localStorage.setItem("coins", coins.toString());
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((user) => user.displayName === username);
  if (userIndex !== -1) {
    users[userIndex].coins = coins;
    localStorage.setItem("users", JSON.stringify(users));
  }
  updateCoinsDisplay();
  // addCoinsReward();
}
function formatCoins(coins) {
  if (coins >= 1000000) {
    return (coins / 1000000).toFixed(1) + "M";
  } else if (coins >= 1000) {
    return (coins / 1000).toFixed(1) + "K";
  } else {
    return coins.toString();
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
    }, 3000);
  }, 1500);

  if(reward == "500000 Coins"){
    addCoinsReward();
  }
}
