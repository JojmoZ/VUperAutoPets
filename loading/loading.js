document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");
  const loadingFill = document.getElementById("loading-fill");
  const totalGameTime = 20 * 2000;
  localStorage.removeItem("ingame");
  const startTime = Date.now();
  const tips = [
    "Kalau melawan tantangan yang tinggi, jangan menyerah!",
    "Nenek gua sakit sakitan masih bisa diamond push up",
    "KR rugi 7 juta masih lanjut hidup",
    "Kalo tersedak, spam mewing",
    "BP gk selesai CUT!",
    "Kenapa lu masih idup? buat nyerah gitu aja?",
    "Skibidi adalah kunci kesuksesan, Ilang emas kunci kejatuhan",
    "Kenapa sangat serius",
    "Aku melihat banyak sekali ampas",
    "Lu pada ninja-ninja mending berdiri",
    "I see lots of prey",
    "Kelarin bp guys!",
    "Rataa ya guys",
    "Solid Solid Solid!",
    "Hati hati besok ilang",
    "Nikmatkan Waktu Bersama selama masi ada",
    "Selesai gk case KKrime.Net",
    "Selesai gk case Krusty bAke?",
    "Selesai gk case GoaThub?",
    "Selesai gk case ScanVision?",
    "Selesai gk case VilLter?",
    "Selesai gk case NieR:CaroluM?",
    "Diam dan Di cut, milik dia yang tak bisa berdiri",
    "Satu dua semut-semut, hati hati kena cut",
    "Panda aja bisa handstand, masa klian gk bs selesaiin bp?",
    "Tenang malam masih panjang",
    "Subco kalian anggap badut?",
    "Subco WD emang badut",
    "Subco DB emang badut",
    "Subco Java emang badut",
    "Subco C emang badut",
    "Jangan Sampe ketauan COPAS",
    "Jangan Budayakan Menyontek ya guys",
    "Jangan Sampe kalo ditanya gk ngerti!",
    "Subco ComVis emang badut",
    "Sudah Siap Network???",
    "一二三四五六七， 你的朋友在哪里？",
    "Kayaknya perlu extend deh...",
  ];

 

  function updateLoading() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min((elapsedTime / totalGameTime) * 100, 100);
    loadingFill.style.width = `${progress}%`;
    animalVUnt.style.left = `calc(${progress}% - 1.5rem)`; // Adjust the position of the animal

    if (elapsedTime >= totalGameTime) {
      triggerTransitionToGame()
    }
  }
 function triggerTransitionToGame() {
   if (document.querySelector(".overlay")) return;


   const blackOverlay = document.createElement("div");
   blackOverlay.classList.add("overlay");
   document.body.appendChild(blackOverlay);


   const logo = document.createElement("img");
   logo.src = "../assets/title-logo.png";
   logo.classList.add("logo");
   blackOverlay.appendChild(logo);


   setTimeout(() => {
     blackOverlay.classList.add("fade-in-overlay");
     logo.classList.add("fade-in-logo");


     setTimeout(() => {
       window.location.href = "/game/game.html";
     }, 5000);
   }, 100);
 }

  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = "auto";
  }
  lockScroll();

  let tipBox = null;

  function showRandomTip() {
    if (tipBox) return; // Prevent multiple tips from appearing

    tipBox = document.createElement("div");
    tipBox.classList.add("tip");
    tipBox.textContent = tips[Math.floor(Math.random() * tips.length)];
    document.body.appendChild(tipBox);

    const animalRect = animalVUnt.getBoundingClientRect();
    tipBox.style.left = `${animalRect.left + animalRect.width / 2}px`;
    tipBox.style.top = `${animalRect.top - animalRect.height + 100}px`;

    setTimeout(() => {
      tipBox.classList.add("tip-animate-in");
    }, 100);

    setTimeout(() => {
      tipBox.classList.remove("tip-animate-in");
      tipBox.classList.add("tip-animate-out");
      setTimeout(() => {
        document.body.removeChild(tipBox);
        tipBox = null; // Allow new tips to appear
      }, 500);
    }, 3000);
  }

  const animalVUnt = document.createElement("img");
  animalVUnt.src = "../assets/Animals/VUnt.webp";
  animalVUnt.style.width = "5rem";
  animalVUnt.style.height = "5rem";
  animalVUnt.style.position = "relative";
  animalVUnt.style.top = "-7rem";
  animalVUnt.style.transform ="scaleX(-1)";
  animalVUnt.classList.add("animal-vunt");
  document.getElementById("loading-bar").appendChild(animalVUnt);

  animalVUnt.addEventListener("click", showRandomTip);

  setInterval(updateLoading, 100);

  const backgroundAudio = new Audio(
    "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
  );
  backgroundAudio.volume = 0.08;
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
});

