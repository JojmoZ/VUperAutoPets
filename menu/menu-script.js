document.getElementById("burger-btn").addEventListener("click", function () {
  const menu = document.getElementById("menu");
  menu.classList.toggle("hidden");
});

window.onload = () => {
  localStorage.removeItem("ingame");
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
 const backgroundAudio = new Audio(
   "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
 );
 backgroundAudio.volume = 0.09;
 backgroundAudio.loop = true;

 const savedTime = localStorage.getItem("backgroundAudioTime");
 if (savedTime) {
   backgroundAudio.currentTime = parseFloat(savedTime);
 }

 const playBackgroundAudio = () => {
   backgroundAudio.play();
   document.removeEventListener("click", playBackgroundAudio);
   document.removeEventListener("keydown", playBackgroundAudio);
   document.removeEventListener("mousemove", playBackgroundAudio);
   document.removeEventListener("scroll", playBackgroundAudio);
   document.removeEventListener("touchstart", playBackgroundAudio);
   document.removeEventListener("focus", playBackgroundAudio);
   document.removeEventListener("mousedown", playBackgroundAudio);
   document.removeEventListener("mouseup", playBackgroundAudio);
 };

 document.addEventListener("click", playBackgroundAudio);
 document.addEventListener("keydown", playBackgroundAudio);
 document.addEventListener("mousemove", playBackgroundAudio);
 document.addEventListener("scroll", playBackgroundAudio);
 document.addEventListener("touchstart", playBackgroundAudio);
 document.addEventListener("focus", playBackgroundAudio);
 document.addEventListener("mousedown", playBackgroundAudio);
 document.addEventListener("mouseup", playBackgroundAudio);
};
