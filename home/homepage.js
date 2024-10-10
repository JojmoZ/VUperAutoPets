window.onload = function () {
  console.log("Script Loaded");
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("useruser").textContent = `Welcome ${username}!`;
  } else {
    window.location.href = "/login/start.html";
  }
  const sections = document.querySelectorAll(".fade-in-section");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible"); // Optional: remove if you don't want the animation to replay
        }
      });
    },
    { threshold: 0.3 } // Trigger when 30% of the section is visible
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
  const carouselSection = document.querySelector(".game-maker");
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
  let autoSlideInterval;

  const carouselImageElement = document.getElementById("carousel-image");
  const carouselTextElement = document.getElementById("carousel-text");
  const indicators = document.querySelectorAll(".indicator");

  function fadeOutAndChangeContent() {
    carouselImageElement.style.opacity = "0";
    carouselTextElement.style.opacity = "0";

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      updateCarousel();
      setTimeout(() => {
        carouselImageElement.style.opacity = "1";
        carouselTextElement.style.opacity = "1";
      }, 50);
    }, 1000);
  }

  function updateCarousel() {
    carouselImageElement.src = carouselImages[currentIndex];
    carouselTextElement.textContent = carouselTexts[currentIndex];
    updateIndicators();
  }

  function updateIndicators() {
    indicators.forEach((indicator, index) => {
      if (index === currentIndex) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });
  }

  // Function to start the carousel timer
  function startCarousel() {
    if (!autoSlideInterval) {
      autoSlideInterval = setInterval(fadeOutAndChangeContent, 5000);
    }
  }

  // Function to stop the carousel timer
  function stopCarousel() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }

  indicators.forEach((indicator) => {
    indicator.addEventListener("click", function () {
      currentIndex = parseInt(this.dataset.index);
      stopCarousel(); // Stop the timer when user interacts
      updateCarousel();
      startCarousel(); // Restart the timer
    });
  });

  updateCarousel();

  // Observe the carousel section
  const carouselObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("Carousel is visible, starting the carousel timer");
          startCarousel(); // Start the carousel timer when in view
        } else {
          console.log("Carousel is not visible, stopping the carousel timer");
          stopCarousel(); // Stop the carousel timer when out of view
        }
      });
    },
    { threshold: 0.5 }
  );
  carouselObserver.observe(carouselSection);
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


