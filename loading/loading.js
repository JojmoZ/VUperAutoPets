document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");
  const loadingFill = document.getElementById("loading-fill");
  const totalGameTime = 20 * 1000;
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
  "Selesai gk case GiThub?",
  "Selesai gk case Steven?",
  "Selesai gk case Filtert?",
  "Selesai gk case NieR:CaroluM?",
  "Diam dan Di cut, milik dia yang tak bisa berdiri",
  "Satu dua semut-semut, hati hati kena cut",
  "Panda aja bisa handstand, masa klian gk bs selesaiin bp?",
  "Tenang malam masih panjang",
  "Subco kalian anggap badut?",
  "Subco WD emang badut",
  "Subco DB emang badut",
  "Subco Java emang badut",
  "Subco C pernah katain trainer badut",
  "Jangan Sampe ketuan COPAS",
  "Jangan Budayakan Menyontek ya guys",
  "Jangan Sampe kalo ditanya gk ngerti!",
  "Subco ComVis emang badut",
  "Sudah Siap Network???",
  "一二三四五六七， 你的朋友在哪里？",
  "Kayaknya perlu extend deh..."
];

  const mainContent = document.querySelector(".main-content");
  let storedAnimals;
  try {
    storedAnimals = JSON.parse(localStorage.getItem("ownedAnimals"));
    if (!Array.isArray(storedAnimals) || !storedAnimals.length) {
      throw new Error("Invalid data");
    }
  } catch (e) {
    storedAnimals = [
      { name: "VUnt", img: "../assets/Animals/VUnt.webp" },
      { name: "caKRbara", img: "../assets/Animals/caKRbara.webp" },
    ];
  }
  const animals = storedAnimals;

  function updateLoading() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min((elapsedTime / totalGameTime) * 100, 100);
    loadingFill.style.width = `${progress}%`;

    if (elapsedTime >= totalGameTime) {
      window.location.href = "/game/index.html";
    }
  }
  const activeTips = [];
  const padding =20;
  function showRandomTip() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const tipElement = document.createElement("div");
    tipElement.className = "tip";
    tipElement.textContent = tip;

    const animalElement = document.createElement("img");
    animalElement.src = animal.img;
    animalElement.alt = animal.name;
    animalElement.className = "animal";

    const maxAttempts = 20; 
    let attempts = 0;
    let topPosition, leftPosition, position, tipBox;

    do {
      topPosition = Math.random() * 70 + 10; 
      leftPosition = Math.random() * 80 + 10;

      if (leftPosition < 30) {
        position = "left";
      } else if (leftPosition > 70) {
        position = "right";
      } else {
        position = "center";
      }

      tipElement.style.position = "absolute";
      tipElement.style.top = `${topPosition}%`;
      tipElement.style.left = `${leftPosition}%`;
      tipElement.style.right = "auto";
      tipElement.style.transform = "none";
      // tipElement.style.border = "2px solid red";

      animalElement.style.position = "absolute";
      animalElement.style.top = "60%";
      if (position === "left") {
         tipElement.style.left = `${leftPosition}%`;
         tipElement.style.right = "auto";
         tipElement.style.flexDirection = "row-reverse";
         animalElement.style.left = "-3.125rem";
         animalElement.classList.add("mirror");
      } else if (position === "right") {
       tipElement.style.right = `${100 - leftPosition}%`;
       tipElement.style.left = "auto";
       animalElement.style.right = "-3.125rem";
       tipElement.style.flexDirection = "row";
      } else {
        tipElement.style.left = "50%";
        tipElement.style.transform = "translateX(-50%)";
        animalElement.style.right = "-3.125rem";
        tipElement.style.flexDirection = "row";
      }

      mainContent.appendChild(tipElement);
      tipBox = tipElement.getBoundingClientRect();
      mainContent.removeChild(tipElement);

      // const debugPaddingBox = document.createElement("div");
      // debugPaddingBox.style.position = "absolute";
      // debugPaddingBox.style.border = "1px dashed red"; // Dashed red border for padding area
      // debugPaddingBox.style.top = `${tipBox.top - padding}px`;
      // debugPaddingBox.style.left = `${tipBox.left - padding}px`;
      // debugPaddingBox.style.width = `${tipBox.width + 2 * padding}px`;
      // debugPaddingBox.style.height = `${tipBox.height + 2 * padding}px`;
      // debugPaddingBox.style.pointerEvents = "none"; // Make sure it doesn’t interfere with anything
      // debugPaddingBox.className = "debug-padding-box";
      // mainContent.appendChild(debugPaddingBox);

      const overlap = activeTips.some((activeTip) =>
        isOverlappingWithPadding(activeTip, tipBox, padding)
      );

      if (!overlap) {
        break;
      }

      attempts++;
      //  mainContent.removeChild(debugPaddingBox);
      console.log(`Attempt ${attempts}: Overlap detected, retrying...`);
    } while (attempts < maxAttempts);

    if (attempts < maxAttempts) {
      tipElement.appendChild(animalElement);
      mainContent.appendChild(tipElement);
      const currentTipBox = tipElement.getBoundingClientRect();
      activeTips.push(currentTipBox);

      setTimeout(() => {
        tipElement.classList.add("tip-animate-in");
      }, 100);

      setTimeout(() => {
        tipElement.classList.remove("tip-animate-in");
        tipElement.classList.add("tip-animate-out");
        setTimeout(() => {
          mainContent.removeChild(tipElement);
        const index = activeTips.findIndex(
          (activeTip) => activeTip === currentTipBox
        );
        if (index > -1) activeTips.splice(index, 1);
        }, 500);
      }, 5000);
    } else {
      console.warn(
        "Max attempts reached; unable to place tip without overlap."
      );
    }
  }
  function isOverlappingWithPadding(rect1, rect2, padding) {
    return !(
      rect1.right + padding < rect2.left - padding ||
      rect1.left - padding > rect2.right + padding ||
      rect1.bottom + padding < rect2.top - padding ||
      rect1.top - padding > rect2.bottom + padding
    );
  }

  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = "auto";
  }
  lockScroll();

  setInterval(updateLoading, 100);
  setInterval(showRandomTip, 3000);

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;

    layers.forEach((layer) => {
      const speed = layer.getAttribute("data-speed");
      const movement = -((scrollTop * speed) / 100);
      layer.style.transform = `translate3d(0px, ${movement}px, 0px)`;
    });
  });
  window.addEventListener("load", () => {
    setTimeout(() => {
      const scrollDuration = 5000;
      const start = window.pageYOffset;
      const end = mainContent.offsetTop;
      const distance = end - start;
      const startTime = performance.now();

      function scrollStep(timestamp) {
        const progress = Math.min((timestamp - startTime) / scrollDuration, 1);
        window.scrollTo(0, start + distance * progress);
        if (progress < 1) {
          requestAnimationFrame(scrollStep);
        } else {
          unlockScroll();
        }
      }

      requestAnimationFrame(scrollStep);
    }, 3000); 
  });
    const backgroundAudio = new Audio(
      "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
    );
    backgroundAudio.volume = 0.08;
    backgroundAudio.loop = true;

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
