document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");
  const loadingFill = document.getElementById("loading-fill");
  const totalGameTime = 20 * 1000;
  const startTime = Date.now();
  const tips = [
    "Lorem ipsum dolor sit amet.",
    "Consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt.",
    "Ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam.",
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
      // window.location.href = "/game/index.html";
    }
  }

  // Array to store the bounding boxes of currently displayed tips
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

    // Define maximum number of attempts to find a non-overlapping position
    const maxAttempts = 15;
    let attempts = 0;
   let topPosition, leftPosition, position, tipBox;

    do {
      // Randomize positions within constrained bounds
      topPosition = Math.random() * 60 + 10; // Constrain between 10% and 70% vertically
      leftPosition = Math.random() * 70 + 20; // Constrain between 10% and 90% horizontally
       if (leftPosition < 20) {
         position = "right"; // "R" section, animal on right side of tip
       } else if (leftPosition < 40) {
         position = "left"; // "L" section, animal on left side of tip
       } else if (leftPosition < 60) {
         position = "right"; // "R" section, animal on right side of tip
       } else if (leftPosition < 80) {
         position = "right"; // "R" section, animal on right side of tip
       } else {
         position = "left"; // "L" section, animal on left side of tip
       }
      // Temporarily set position to calculate bounding box
      tipElement.style.position = "absolute";
      tipElement.style.top = `${topPosition}%`;
      tipElement.style.left = `${leftPosition}%`;
      tipElement.style.right = "auto";
      tipElement.style.transform = "none";
      animalElement.style.position = "absolute";
       animalElement.style.top =`${60}%`; // Adjusted to make the animal 
      if (position === "left") {
        tipElement.style.left = `${leftPosition}%`;
      tipElement.style.right = "auto";
      tipElement.style.flexDirection = "row-reverse"; // Animal on the left
      animalElement.style.left = "-3.125rem";
      animalElement.classList.add("mirror");
      } else if (position === "right") {
        tipElement.style.right = `${100 - leftPosition}%`;
      tipElement.style.left = "auto";
      animalElement.style.right = "-3.125rem";
      tipElement.style.flexDirection = "row"; // Animal on the right
      } else {
        tipElement.style.left = "50%";
        tipElement.style.transform = "translateX(-50%)";
        animalElement.style.right = "-3.125rem";
        tipElement.style.flexDirection = "row"; // Default to animal on the
      }

      // Temporarily add to the DOM to get the bounding box
      mainContent.appendChild(tipElement);
      tipBox = tipElement.getBoundingClientRect();
      mainContent.removeChild(tipElement);

      // Check for overlap with existing tips
      const overlap = activeTips.some((activeTip) =>
        isOverlappingWithPadding(activeTip, tipBox, padding)
      );

      if (!overlap) {
        // If no overlap, break the loop and place the tip
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    // Add the animal image to the tip and finalize the position
    tipElement.appendChild(animalElement);
    mainContent.appendChild(tipElement);

    // Store the bounding box of the new tip
    activeTips.push(tipElement.getBoundingClientRect());

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

        // Remove the tip's bounding box from the activeTips array
        const index = activeTips.indexOf(tipElement.getBoundingClientRect());
        if (index > -1) activeTips.splice(index, 1);
      }, 500);
    }, 5000);
  }

  // Helper function to check if two rectangles overlap
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

  // Lock scroll initially
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
        } else {
          // Unlock scroll once the page has scrolled to the bottom
          unlockScroll();
        }
      }

      requestAnimationFrame(scrollStep);
    }, 3000); // Delay to ensure all assets are loaded
  });
});
