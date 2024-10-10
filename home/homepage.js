window.onload = function () {
  console.log("Script Loaded");
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("useruser").textContent = `Welcome ${username}!`;
  } else {
    window.location.href = "/login/start.html";
  }
  const gameDescSection = document.querySelector(".game-desc");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gameDescSection.classList.add("visible");
          console.log("Game Description is visible");
        } else {
          gameDescSection.classList.remove("visible");
          console.log("Game Description is not visible");
        }
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(gameDescSection);
  const carouselImages = [
    "../assets/LogoVUPER.jpg",
    "../assets/Steam.png",
    "../assets/TeamWoodGames.jpg",
  ];
  const carouselTexts = [
    "Super Auto Pets is the first game out of independent studio Team Wood Games, and is available both as a free browser title as well as a mobile app for Android, it’s certainly a game worth checking out.",
    "This game is available in Steam! Download VUper Auto Pets Free Now!",
    "We are the creators of this game, you can see more of us in https://itch.io/profile/teamwood",
  ];
  let currentIndex = 0;
  const carouselImageElement = document.getElementById("carousel-image");
  const carouselTextElement = document.getElementById("carousel-text");
  const indicators = document.querySelectorAll(".indicator");

  // Function to fade out and change the image and text
  function fadeOutAndChangeContent() {
    // Fade out both the image and the text
    carouselImageElement.style.opacity = "0";
    carouselTextElement.style.opacity = "0";

    setTimeout(() => {
      // Change to the next image and text
      currentIndex = (currentIndex + 1) % carouselImages.length;
      updateCarousel();
      // Fade in both the image and the text
      setTimeout(() => {
        carouselImageElement.style.opacity = "1";
        carouselTextElement.style.opacity = "1";
      }, 50); // Short delay to ensure fade-in happens after content change
    }, 1000); // 1-second fade-out duration
  }

  // Update the carousel image and text
  function updateCarousel() {
    carouselImageElement.src = carouselImages[currentIndex];
    carouselTextElement.textContent = carouselTexts[currentIndex];
    updateIndicators();
  }

  // Update the indicators to reflect the current image
  function updateIndicators() {
    indicators.forEach((indicator, index) => {
      if (index === currentIndex) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });
  }

  // Auto-slide the carousel every 5 seconds
  let autoSlideInterval = setInterval(fadeOutAndChangeContent, 5000);

  // Allow clicking on indicators to navigate to specific images
  indicators.forEach((indicator) => {
    indicator.addEventListener("click", function () {
      currentIndex = parseInt(this.dataset.index);
      clearInterval(autoSlideInterval); // Stop auto-slide when user clicks
      updateCarousel();
      autoSlideInterval = setInterval(fadeOutAndChangeContent, 5000); // Resume auto-slide
    });
  });

  // Initialize the carousel
  updateCarousel();
  const socialMediaSection = document.querySelector(".social-media");
  const instagram = document.querySelector(".instagram");
  const twitter = document.querySelector(".twitter");
  const steam = document.querySelector(".steam");
  const socialMediaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          instagram.classList.add("walk");
          twitter.classList.add("walk");
          steam.classList.add("walk");
          console.log("Social Media is visible");
        } else {
          instagram.classList.remove("walk");
          twitter.classList.remove("walk");
          steam.classList.remove("walk");
          console.log("Social Media is not visible");
        }
      });
    },
    { threshold: 0.5 }
  );
  socialMediaObserver.observe(socialMediaSection);
  const gotoplay = document.getElementById("play-button");
  gotoplay.addEventListener("click", function (e) {
    window.location = "/game/index.html";
  });
};


