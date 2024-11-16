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
        { threshold: 0.5 } 
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
  checkboughtanimals()
    if(canPlay){
      window.location = "/loading/loading.html";
    }else{
      alert(1)
    }
  });
let canPlay = false;
function checkboughtanimals(){
  const boughtanimals = localStorage.getItem("ownedAnimals");
  console.log(boughtanimals.length)
  if (boughtanimals.length ==2){
    canPlay = false;
  }else{
    canPlay = true;
  }
}
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
  const barHeightFactor = 0.4; 
  function renderFrame() {
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    analyser.getByteFrequencyData(dataArray);

    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      
      const barHeight =
        (Math.pow(dataArray[i], 3) / 210 ** 2) * barHeightFactor;
      const color = `rgb(253, ${250 * (i / bufferLength)}, 50)`;

      const barYPosition = canvasHeight / 1.6; 

      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(x, barYPosition - barHeight, barWidth, barHeight);

      canvasCtx.fillStyle = `rgba(103, ${250 * (i / bufferLength)}, 50, 0.5)`; 
      canvasCtx.fillRect(x, barYPosition, barWidth, barHeight);

      x += barWidth + 1; 
    }

    requestAnimationFrame(renderFrame);
  }

  renderFrame();

  
  const ostSection = document.querySelector(".ost-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          audio.play(); 
        } else {
          audio.pause(); 
        }
      });
    },
    { threshold: 0.5 } 
  );

  observer.observe(ostSection);
};

track = document.getElementById("maps");
const handleOnDown = (e) => (track.dataset.mouseDownAt = e.clientX);

const handleOnUp = () => {
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage;
};

const handleOnMove = (e) => {
  if (track.dataset.mouseDownAt === "0") return;

  const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
    maxDelta = window.innerWidth / 2;

  const percentage = (mouseDelta / maxDelta) * -100,
    nextPercentageUnconstrained =
      parseFloat(track.dataset.prevPercentage) + percentage,
    nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

  track.dataset.percentage = nextPercentage;

  track.animate(
    {
      transform: `translate(${nextPercentage}%, -50%)`,
    },
    { duration: 1200, fill: "forwards" }
  );

  for (const image of track.getElementsByClassName("image")) {
    image.animate(
      {
        objectPosition: `${100 + nextPercentage}% center`,
      },
      { duration: 1200, fill: "forwards" }
    );
  }
};

/* -- Had to add extra lines for touch events -- */

window.onmousedown = (e) => handleOnDown(e);

window.ontouchstart = (e) => handleOnDown(e.touches[0]);

window.onmouseup = (e) => handleOnUp(e);

window.ontouchend = (e) => handleOnUp(e.touches[0]);

window.onmousemove = (e) => handleOnMove(e);

window.ontouchmove = (e) => handleOnMove(e.touches[0]);