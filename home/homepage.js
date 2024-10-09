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
  const autoSlide = () => {
    fadeOutAndChangeImage();
  };
  function fadeOutAndChangeImage() {
    carouselImageElement.classList.add("hidden");
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      updateCarousel();
      carouselImageElement.classList.remove("hidden");
    }, 1000); 
  }
  let autoSlideInterval = setInterval(autoSlide, 5000);
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
   indicators.forEach((indicator) => {
     indicator.addEventListener("click", function () {
       currentIndex = parseInt(this.dataset.index);
       clearInterval(autoSlideInterval); // Stop auto-slide when user clicks
       updateCarousel();
       autoSlideInterval = setInterval(autoSlide, 5000); // Resume auto-slide
     });
   });
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
};