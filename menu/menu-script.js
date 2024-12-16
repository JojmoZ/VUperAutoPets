const overlay = document.getElementById("overlay");
const menu = document.getElementById("menu");
const settingsMenu = document.getElementById("settings-menu");

document.getElementById("burger-btn").addEventListener("click", function () {
  overlay.classList.toggle("hidden");
  menu.classList.toggle("hidden");
});

document.getElementById("settings-btn").addEventListener("click", function () {
  settingsMenu.classList.remove("hidden");
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

    window.location.href = "/login/index.html";
  }

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

  overlay.addEventListener("click", function () {
    const menu = document.getElementById("menu");
    overlay.classList.toggle("hidden");
    menu.classList.toggle("hidden");
    settingsMenu.classList.add("hidden");
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
   const username = localStorage.getItem("username").split(" ")[0];
   const el = document.querySelector("#typewriter");
    const words = [
      `Welcome, <span class="username">${username} </span>!`,
      `Bienvenido, <span class="username">${username} </span>!`,
      `Bienvenue, <span class="username">${username} </span>!`,
      `Willkommen, <span class="username">${username} </span>!`,
      `Benvenuto, <span class="username">${username} </span>!`,
    ];

    const sleepTime = 100;
    let currWordIndex = 0;

    const sleep = (time) => {
      return new Promise((resolve) => setTimeout(resolve, time));
    };

    const effect = async () => {
      while (true) {
        const currWord = words[currWordIndex];
        let isTag = false;

        for (let i = 0; i < currWord.length; i++) {
          if (currWord[i] === "<") isTag = true;
          if (currWord[i] === ">") isTag = false;

          el.innerHTML = currWord.substring(0, i + 1);
          if (!isTag) await sleep(sleepTime);
        }

        await sleep(3000);

        for (let i = currWord.length; i >= 0; i--) {
          if (currWord[i] === ">") isTag = true;
          if (currWord[i] === "<") isTag = false;

          el.innerHTML = currWord.substring(0, i);
          if (!isTag) await sleep(sleepTime);
        }

        let nextWordIndex;
        do {
          nextWordIndex = Math.floor(Math.random() * words.length);
        } while (nextWordIndex === currWordIndex);

        currWordIndex = nextWordIndex;
      }
    };
    effect();
};
