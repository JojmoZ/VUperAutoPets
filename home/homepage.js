window.onload = function () {
  console.log("Script Loaded");
 const username = localStorage.getItem("username");
 if (username) {
   document.querySelector(
     ".jumbotron h1"
   ).textContent = `Welcome, ${username}, to VUper Auto Pets`;
 } else {
   window.location.href = "/login/start.html";
 }
  // IntersectionObserver to detect when the game-desc section is in view
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
  ); // 50% of the section needs to be visible

  observer.observe(gameDescSection);

  // Carousel Logic
  const carouselImages = ["../assets/Steam.png", "../assets/TeamWoodGames.jpg", "../assets/LogoVUPER.jpg"];
  const carouselTexts = [
    "This is the description for image 1.",
    "This is the description for image 2.",
    "This is the description for image 3.",
  ];

  let currentIndex = 0;

  const carouselImageElement = document.getElementById("carousel-image");
  const carouselTextElement = document.getElementById("carousel-text");

  document.getElementById("next-button").addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % carouselImages.length;
    updateCarousel();
  });

  document.getElementById("prev-button").addEventListener("click", function () {
    currentIndex =
      (currentIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarousel();
  });

  function updateCarousel() {
    carouselImageElement.src = carouselImages[currentIndex];
    carouselTextElement.textContent = carouselTexts[currentIndex];
  }

  // Social Media Animation Logic
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
