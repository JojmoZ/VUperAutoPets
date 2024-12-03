window.onload = function () {
  localStorage.removeItem("ingame");
  const track = document.getElementById("maps");

  const backbtn = document.getElementById("backArrow");
  backbtn.addEventListener("click", function () {
    window.location = "/menu/menu.html";
  });
  track.dataset.percentage = "-30";
  track.style.transform = `translate(-30%, -50%)`;

  const username = localStorage.getItem("username");
  const logged = localStorage.getItem("loggedin");
  const el = document.querySelector("#typewriter");
  if (logged) {
    const words = [
      `Welcome, <span class="username">${username} </span>!`,
      `Bienvenido, <span class="username">${username} </span>!`,
      `Bienvenue, <span class="username">${username} </span>!`,
      `Willkommen, <span class="username">${username} </span>!`,
      `Benvenuto, <span class="username">${username} </span>!`,
    ];

    const sleepTime = 100;
    let currWordIndex = 0;

    const sleep = (time) => {
      return new Promise((resolve) => setTimeout(resolve, time));
    };

    const effect = async () => {
      while (true) {
        const currWord = words[currWordIndex];
        let isTag = false;

        for (let i = 0; i < currWord.length; i++) {
          if (currWord[i] === "<") isTag = true;
          if (currWord[i] === ">") isTag = false;

          el.innerHTML = currWord.substring(0, i + 1);
          if (!isTag) await sleep(sleepTime);
        }

        await sleep(3000);

        for (let i = currWord.length; i >= 0; i--) {
          if (currWord[i] === ">") isTag = true;
          if (currWord[i] === "<") isTag = false;

          el.innerHTML = currWord.substring(0, i);
          if (!isTag) await sleep(sleepTime);
        }

        let nextWordIndex;
        do {
          nextWordIndex = Math.floor(Math.random() * words.length);
        } while (nextWordIndex === currWordIndex);

        currWordIndex = nextWordIndex;
      }
    };
    effect();
  } else {
    window.location.href = "/login/index.html";
  }
  const fadeInElements = document.querySelectorAll(".fade-in-element");
  const elementObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("visible")
        ) {
          entry.target.classList.add("visible");
        } else if (
          !entry.isIntersecting &&
          entry.target.classList.contains("visible")
        ) {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.5 }
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
    "../assets/social-media/Steam.png",
    "../assets/home-asset/TeamWoodGames.jpg",
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
  // const contact = document.querySelector(".contact-us");
  const instagram = document.querySelector(".instagram");
  const twitter = document.querySelector(".twitter");
  const steam = document.querySelector(".steam");
  const socialMediaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // contact.classList.add("visible");
          instagram.classList.add("walk");
          twitter.classList.add("walk");
          steam.classList.add("walk");
          console.log("Social Media is visible");
        } else {
          // contact.classList.remove("visible");
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

  const audio = document.getElementById("audio");
  const visualization = document.getElementById("visualization");
  const context = new (window.AudioContext || window.webkitAudioContext)();
  let isPlaying = false;

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
      const color = `rgba(203, ${50 + (dataArray[i] / 255) * 205}, 36, 0.8)`;

      const barYPosition = canvasHeight / 1.6;

      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(x, barYPosition - barHeight, barWidth, barHeight);

      canvasCtx.fillStyle = `rgba(203, ${
        50 + (dataArray[i] / 255) * 205
      }, 36, 0.5)`;
      canvasCtx.fillRect(x, barYPosition, barWidth, barHeight);

      x += barWidth + 1;
    }

    requestAnimationFrame(renderFrame);
  }

  const playOSTButton = document.getElementById("ost-play-button");
  const buttonIcon = document.getElementById("button-icon");
  playOSTButton.addEventListener("mousemove", (e) => {
    const rect = playOSTButton.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    playOSTButton.style.setProperty("--mouseX", `${x}px`);
    playOSTButton.style.setProperty("--mouseY", `${y}px`);
  });

  playOSTButton.addEventListener("click", function () {
    if (!isPlaying) {
      if (context.state === "suspended") {
        context.resume();
      }
      audio.play();
      buttonIcon.src = "../assets/home-asset/pause.png";
      isPlaying = true;
      renderFrame();
    } else {
      audio.pause();
      buttonIcon.src = "../assets/home-asset/playmusic.png";
      isPlaying = false;
    }
  });
  const jumbotron = document.querySelector(".jumbotron");
  const trailer = document.querySelector(".trailer");
  const gamedesc = document.querySelector(".game-desc");
  const gamemaker = document.querySelector(".game-maker");
  const ostsec = document.querySelector(".ost-section");
  let djigsrc = "../assets/Animals/DJig.webp";
  let liber = "../assets/Animals/Liberian_Husky.webp";
  let owlf = "../assets/Animals/owLF.webp";
  let ppat = "../assets/Animals/PPat.webp";
  let labbik = "../assets/Animals/LabbiK.webp";

  function walkPerSection(section, animal) {
    if (section.querySelector(".animalWalk")) return;

    const animalImg = document.createElement("img");
    animalImg.src = animal;
    animalImg.classList.add("animalWalk");
    section.appendChild(animalImg);
    const spawnSide = Math.random() < 0.5 ? "left" : "right";
    animalImg.style[spawnSide] = "-100px";
    if (spawnSide === "left") {
      animalImg.style.transform = "scaleX(-1)";
    }

    const walkDirection = spawnSide === "left" ? "right" : "left";

    setTimeout(() => {
      animalImg.style.transition =
        "transform 10s linear, bottom 1s ease-in-out";
      animalImg.style.transform = `translateX(${
        walkDirection === "right"
          ? "calc(100vw + 100px)"
          : "calc(-100vw - 100px)"
      }) ${spawnSide === "left" ? "scaleX(-1)" : ""}`;

      let direction = 4;
      const oscillate = () => {
        animalImg.style.bottom = `${
          parseInt(animalImg.style.bottom || 0) + direction * 35
        }px`;
        direction *= -1;
        setTimeout(oscillate, 500);
      };
      oscillate();

      animalImg.addEventListener("transitionend", () => {
        animalImg.remove();
      });
    }, 1000);
  }

  const sections = [
    { element: document.querySelector(".jumbotron"), animal: djigsrc },
    { element: document.querySelector(".trailer"), animal: liber },
    { element: document.querySelector(".game-desc"), animal: owlf },
    { element: document.querySelector(".game-maker"), animal: ppat },
    { element: document.querySelector(".ost-section"), animal: labbik },
  ];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = sections.find((sec) => sec.element === entry.target);
          if (section) {
            walkPerSection(section.element, section.animal);
            sectionObserver.unobserve(entry.target);
            setInterval(() => {
              if (Math.random() < 0.2) {
                walkPerSection(section.element, section.animal);
              }
            }, 1000);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section.element);
  });

  const handleOnDown = (e) => {
    track.dataset.mouseDownAt = e.clientX;
  };

  const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage || "0";
  };

  const handleOnMove = (e) => {
    if (track.dataset.mouseDownAt === "0") return;

    const mouseDownAt = parseFloat(track.dataset.mouseDownAt);
    const prevPercentage = parseFloat(track.dataset.prevPercentage);
    if (isNaN(mouseDownAt) || isNaN(prevPercentage)) return;

    const mouseDelta = mouseDownAt - e.clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = prevPercentage + percentage;
    const nextPercentage = Math.max(
      Math.min(nextPercentageUnconstrained, 0),
      -100
    );

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
  window.onmousedown = (e) => handleOnDown(e);
  window.ontouchstart = (e) => handleOnDown(e.touches[0]);
  window.onmouseup = (e) => handleOnUp(e);
  window.ontouchend = (e) => handleOnUp(e.touches[0]);
  window.onmousemove = (e) => handleOnMove(e);
  window.ontouchmove = (e) => handleOnMove(e.touches[0]);

  const backgroundAudio = new Audio(
    "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
  );
  backgroundAudio.volume = 0.09;
  backgroundAudio.loop = true;

  const savedTime = localStorage.getItem("backgroundAudioTime");
  if (savedTime) {
    backgroundAudio.currentTime = parseFloat(savedTime);
  }

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

  window.addEventListener("beforeunload", () => {
    localStorage.setItem("backgroundAudioTime", backgroundAudio.currentTime);
  });

  // Hat configurations for dynamic positioning
  const hatConfigurations = {
    "abandon-hat": {
      top: "-40%",
      left: "15%",
      transform: "rotate(10deg)",
    },
    crown: {
      top: "-30%",
      left: "10%",
      width: "11rem",
      transform: "rotate(10deg)",
    },
    foil: {
      top: "-35%",
      left: "14%",
      transform: "rotate(5deg)",
    },
    paper: {
      top: "-23%",
      left: "15%",
      transform: "rotate(8deg) scaleX(-1)",
    },
    santa: {
      top: "-25%",
      left: "18%",
      transform: "rotate(5deg)",
    },
    trophy: {
      top: "-35%",
      left: "16%",
      transform: "rotate(15deg)",
    },
  };

  const hatImages = [
    "../assets/hats/abandon-hat.png",
    "../assets/hats/crown.png",
    "../assets/hats/foil.png",
    "../assets/hats/paper.png",
    "../assets/hats/santa.png",
    "../assets/hats/trophy.png",
  ];
  let currentHatIndex = 0;

  const hatImage = document.querySelector(".Hats img");

  // Function to update the hat image and its position dynamically
  function updateHatCarousel() {
    const hatPath = hatImages[currentHatIndex];
    const hatName = hatPath.split("/").pop().replace(".png", ""); // Extract the hat name
    const config = hatConfigurations[hatName];

    // Update the hat image source
    hatImage.src = hatPath;

    // Apply dynamic positioning styles
    if (config) {
      const hatElement = document.querySelector(".Hats");
      hatElement.style.top = config.top;
      hatElement.style.left = config.left;
      hatImage.style.width = config.width || "11rem";
      hatElement.style.transform = config.transform || "none";
    }
  }

  // Left arrow click handler
  document.getElementById("hat-left-arrow").addEventListener("click", () => {
    currentHatIndex =
      (currentHatIndex - 1 + hatImages.length) % hatImages.length;
    updateHatCarousel();
  });

  // Right arrow click handler
  document.getElementById("hat-right-arrow").addEventListener("click", () => {
    currentHatIndex = (currentHatIndex + 1) % hatImages.length;
    updateHatCarousel();
  });

  // Initialize the carousel with the first hat
  updateHatCarousel();
};
