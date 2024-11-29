document.getElementById("burger-btn").addEventListener("click", function () {
  const menu = document.getElementById("menu");
  menu.classList.toggle("hidden");
});

window.onload = () => {
  let canPlay = false;
  const playbtn = document.getElementById("play-btn");
  playbtn.addEventListener("click", function () {
    checkboughtanimals();
      if (canPlay) {
        window.location = "/loading/loading.html";
      } else {
        ShowModal("You need to have at least 1 animal to play the game!");
      }
  });
  const homebtn = document.getElementById("home-btn");
  homebtn.addEventListener("click", function () {
    window.location.href = "/home/homepage.html";
  });
  const barnbtn = document.getElementById("barn-btn");
  barnbtn.addEventListener("click", function () {
    window.location.href = "/barn/barnpage.html";
  });
  const shopbtn = document.getElementById("shop-btn");
  shopbtn.addEventListener("click", function () {
    window.location.href = "/shop/shoppage.html";
  });
  document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("username");
    localStorage.removeItem("loggedin");
    localStorage.removeItem("coins");
    localStorage.removeItem("battleLineup");
    localStorage.removeItem("randomAnimals");
    localStorage.removeItem("lives");
    localStorage.removeItem("gamecoins");
    localStorage.removeItem("ownedAnimals");
    localStorage.removeItem("shopAnimals");
    localStorage.removeItem("currentItems");
    localStorage.removeItem("firstTime");
    localStorage.removeItem("teamName");
    localStorage.removeItem("fromOnline");
    window.location.href = "/login/index.html";
  });
  function checkboughtanimals() {
    const boughtanimals = localStorage.getItem("ownedAnimals");
    console.log(boughtanimals.length);
    if (boughtanimals.length == 2) {
      canPlay = false;
    } else {
      canPlay = true;
    }
  }
 
};
