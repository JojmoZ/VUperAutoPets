window.onload = function () {
  console.log("Script Loaded");
  const username = localStorage.getItem("username");
  const logged = localStorage.getItem("loggedin");
  if (logged) {
    document.getElementById("useruser").textContent = `Welcome ${username}!`;
  } else {
    window.location.href = "/login/start.html";
  }
   const fadeInElements = document.querySelectorAll(".fade-in-element");
      const ostCard = document.querySelector(".ost-card");
      const cardContent = document.querySelector(".card-content");

      const aaa = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              ostCard.classList.add("visible");
              cardContent.classList.add("visible");
            } else {
              ostCard.classList.remove("visible");
              cardContent.classList.remove("visible");
            }
          });
        },
        { threshold: 0.5 } // Trigger when 50% of the section is visible
      );

      aaa.observe(ostCard);
  const elementObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible"); 
        }
      });
    },
    { threshold: 0.3 } 
  );

  fadeInElements.forEach((element) => {
    elementObserver.observe(element);
  });
   const sectionTitles = document.querySelectorAll(".section-title");
   const titleObserver = new IntersectionObserver(
     (entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
           entry.target.classList.add("visible"); 
         } else {
           entry.target.classList.remove("visible"); 
         }
       });
     },
     { threshold: 0.5 } 
   );
   sectionTitles.forEach((title) => {
     titleObserver.observe(title);
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
  function startCarousel() {
    if (!autoSlideInterval) {
      autoSlideInterval = setInterval(fadeOutAndChangeContent, 5000);
    }
  }
  function stopCarousel() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
  indicators.forEach((indicator) => {
    indicator.addEventListener("click", function () {
      currentIndex = parseInt(this.dataset.index);
      stopCarousel(); 
      updateCarousel();
      startCarousel();
    });
  });
  updateCarousel();
  const carouselObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("Carousel is visible, starting the carousel timer");
          startCarousel();
        } else {
          console.log("Carousel is not visible, stopping the carousel timer");
          stopCarousel(); 
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
    window.location = "/loading/loading.html";
  });

  const audio = document.getElementById("audio");
  const visualization = document.getElementById("visualization");
  const context = new (window.AudioContext || window.webkitAudioContext)();

    if (context.state === "suspended") {
      context.resume();
    }
    audio.play();

  const analyser = context.createAnalyser();
  const source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 512;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const canvasCtx = visualization.getContext("2d");
  const canvasHeight = visualization.height;
  const canvasWidth = visualization.width;
  const barWidth = (canvasWidth / bufferLength) * 2.5;
  const barHeightFactor = 0.4; // Adjust this value to reduce overall bar height

  function renderFrame() {
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    analyser.getByteFrequencyData(dataArray);

    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      // Reduce the overall bar height
      const barHeight =
        (Math.pow(dataArray[i], 3) / 210 ** 2) * barHeightFactor;
      const color = `rgb(253, ${250 * (i / bufferLength)}, 50)`;

      // Move the bars down by adjusting the y-position
      const barYPosition = canvasHeight / 1.6; // Move it lower by reducing this value

      // Draw the bar
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(x, barYPosition - barHeight, barWidth, barHeight);

      // Draw the reflection (mirror the bar below the center)
      canvasCtx.fillStyle = `rgba(103, ${250 * (i / bufferLength)}, 50, 0.5)`; // Lighter color with transparency for reflection
      canvasCtx.fillRect(x, barYPosition, barWidth, barHeight);

      x += barWidth + 1; // Space between bars
    }

    requestAnimationFrame(renderFrame);
  }

  renderFrame();

  // Play/pause audio based on section visibility
  const ostSection = document.querySelector(".ost-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          audio.play(); // Play the audio when the section is visible
        } else {
          audio.pause(); // Pause the audio when the section is not visible
        }
      });
    },
    { threshold: 0.5 } // Trigger when 50% of the section is visible
  );

  observer.observe(ostSection);
};


