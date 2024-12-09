const overlay = document.getElementById("overlay");
const path = window.electron.path;
const appDir = window.electron.__dirname;
document.getElementById("burger-btn").addEventListener("click", function () {
  const menu = document.getElementById("menu");
  overlay.classList.toggle("hidden");
  menu.classList.toggle("hidden");
});

window.onload = () => {
  const logged = localStorage.getItem("loggedin");

  if (!logged) {
    function clearLocalStorageExceptUsers() {
      const keysToKeep = ["users"];

      const allKeys = Object.keys(localStorage);

      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }

    clearLocalStorageExceptUsers();

    const loginPath = path.join(appDir, "login/index.html"); // Build the correct file path
    window.location.href = `file://${loginPath}`; // Redirect using the file:// protocol
  }

  localStorage.removeItem("ingame");
  let canPlay = false;
  const playbtn = document.getElementById("play-btn");
  playbtn.addEventListener("click", function () {
    checkboughtanimals();
      if (canPlay) {
        const loadingPath = path.join(appDir, "loading/loading.html"); // Build the correct file path
        window.location.href = `file://${loadingPath}`; // Redirect using the file:// protocol
      } else {
        ShowModal("You need to have at least 1 animal to play the game!");
      }
  });
  const homebtn = document.getElementById("home-btn");
  homebtn.addEventListener("click", function () {
    const homePath = path.join(appDir, "home/homepage.html"); // Build the correct file path
    window.location.href = `file://${homePath}`; // Redirect using the file:// protocol
  });
  const barnbtn = document.getElementById("barn-btn");
  barnbtn.addEventListener("click", function () {
    const barnPath = path.join(appDir, "barn/barnpage.html"); // Build the correct file path
    window.location.href = `file://${barnPath}`; // Redirect using the file:// protocol
  });
  const shopbtn = document.getElementById("shop-btn");
  shopbtn.addEventListener("click", function () {
    const shopPath = path.join(appDir, "shop/shoppage.html"); // Build the correct file path
    window.location.href = `file://${shopPath}`; // Redirect using the file:// protocol
  });

  overlay.addEventListener("click", function () {
    const menu = document.getElementById("menu");
    overlay.classList.toggle("hidden");
    menu.classList.toggle("hidden");
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
    const loginPath = path.join(appDir, "login/index.html"); // Build the correct file path
    window.location.href = `file://${loginPath}`; // Redirect using the file:// protocol
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
