document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");
  const loadingFill = document.getElementById("loading-fill");
  const totalGameTime = 15 * 1000;
  const startTime = Date.now();
  const tips = [
    "Lorem ipsum dolor sit amet.",
    "Consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt.",
    "Ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam.",
  ];
  const mainContent = document.querySelector(".main-content");

  const animals = JSON.parse(localStorage.getItem("ownedAnimals")) || [
    { name: "VUnt", img: "../assets/Animals/VUnt.png" },
    { name: "caKRbara", img: "../assets/Animals/caKRbara.png" },
  ];

  function updateLoading() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min((elapsedTime / totalGameTime) * 100, 100);
    loadingFill.style.width = `${progress}%`;

    if (elapsedTime >= totalGameTime) {
      // window.location.href = "/game/index.html";
    }
  }

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

    const topPosition = Math.random() * 80;
    const leftPosition = Math.random() * 100;
    const position =
      leftPosition < 40 ? "left" : leftPosition > 60 ? "right" : "center";

    tipElement.style.position = "absolute";
    tipElement.style.top = `${topPosition}%`;

    if (position === "left") {
      tipElement.style.left = `${leftPosition}%`;
      tipElement.style.right = "auto";
      tipElement.style.flexDirection = "row-reverse"; // Animal on the left
      animalElement.classList.add("mirror");
    } else if (position === "right") {
      tipElement.style.right = `${100 - leftPosition}%`;
      tipElement.style.left = "auto";
      tipElement.style.flexDirection = "row"; // Animal on the right
    } else {
      // Center position
      tipElement.style.left = "50%";
      tipElement.style.transform = "translateX(-50%)";
      tipElement.style.flexDirection = "row"; // Default to animal on the left in center
    }

    tipElement.appendChild(animalElement);
    mainContent.appendChild(tipElement);

    // Animate tip appearance
    setTimeout(() => {
      tipElement.classList.add("tip-animate-in");
    }, 100);

    // Animate tip disappearance
    setTimeout(() => {
      tipElement.classList.remove("tip-animate-in");
      tipElement.classList.add("tip-animate-out");
      setTimeout(() => {
        mainContent.removeChild(tipElement);
      }, 500);
    }, 5000);
  }

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

  // Ensure all assets are loaded before scrolling
  window.addEventListener("load", () => {
    setTimeout(() => {
      const scrollDuration = 5000; // Increased duration of the scroll in milliseconds
      const start = window.pageYOffset;
      const end = mainContent.offsetTop;
      const distance = end - start;
      const startTime = performance.now();

      function scrollStep(timestamp) {
        const progress = Math.min((timestamp - startTime) / scrollDuration, 1);
        window.scrollTo(0, start + distance * progress);
        if (progress < 1) {
          requestAnimationFrame(scrollStep);
        }
      }

      requestAnimationFrame(scrollStep);
    }, 3000); // Delay to ensure all assets are loaded
  });
});
