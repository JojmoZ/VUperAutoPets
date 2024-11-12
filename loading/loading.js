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
    "Ut enim ad minim veniam."
  ];
  const mainContent = document.querySelector(".main-content");

  // Example animals data from localStorage
  const animals = JSON.parse(localStorage.getItem("ownedAnimals")) || [
    { name: "Cat", image: "../assets/cat.png" },
    { name: "Dog", image: "../assets/dog.png" }
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
    const position = leftPosition < 50 ? "bottom-left" : "bottom-right";
    if (position === "bottom-left") {
      animalElement.classList.add("mirror");
    }

    tipElement.appendChild(animalElement);
    tipElement.style.position = "absolute";
    tipElement.style.top = `${topPosition}%`;
    tipElement.style.left = position === "bottom-left" ? `${leftPosition}%` : "auto";
    tipElement.style.right = position === "bottom-right" ? `${100 - leftPosition}%` : "auto";
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
      }, 500); // Match this duration with the CSS animation duration
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