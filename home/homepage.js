/**
 * SECTION: Hero
 */

const path = window.electron.path;
const appDir = window.electron.__dirname;
const DELAY = 500;

document.addEventListener("DOMContentLoaded", () => {
  const primaryImages = [
    "../assets/login/parallax/parallax-vunt.webp",
    "../assets/login/parallax/parallax-pamstir.webp",
  ];

  const secondaryImages = [
    "../assets/home-asset/hero/rocket.png",
    "../assets/home-asset/hero/teddy.png",
  ];

  const tertiaryImages = [
    "../assets/home-asset/hero/trumpet.png",
    "../assets/home-asset/hero/scissors.png",
  ];

  const groupImages = [
    [
      "../assets/home-asset/hero/img-group-1.png",
      "../assets/home-asset/hero/img-group-2.png",
      "../assets/home-asset/hero/img-group-3.png",
      "../assets/home-asset/hero/img-group-4.png",
    ],
    [
      "../assets/home-asset/hero/coin.png",
      "../assets/home-asset/hero/coin.png",
      "../assets/home-asset/hero/coin.png",
      "../assets/home-asset/hero/coin.png",
    ],
  ];

  let primaryIndex = 0;
  let secondaryIndex = 0;
  let tertiaryIndex = 0;
  let groupSetIndex = 0;
  let groupIndices = [0, 1, 2, 3];

  function cycleImages() {
    const imgPrimary = document.querySelector(".img-primary");
    const imgSecondary = document.querySelector(".img-secondary");
    const imgTertiary = document.querySelector(".img-tertiary");

    function applyTransition(element) {
      element.style.transition = "all 0.5s ease-in-out";
      element.style.opacity = "0";
      element.style.transform = "translateY(50px)";
    }

    function setNewImage(element, newSrc, delay) {
      setTimeout(() => {
        element.src = newSrc;
        setTimeout(() => {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }, DELAY);
      }, delay);
    }

    primaryIndex = (primaryIndex + 1) % primaryImages.length;
    applyTransition(imgPrimary);
    setNewImage(imgPrimary, primaryImages[primaryIndex], DELAY);

    secondaryIndex = (secondaryIndex + 1) % secondaryImages.length;
    applyTransition(imgSecondary);
    setNewImage(imgSecondary, secondaryImages[secondaryIndex], DELAY * 1.3);

    tertiaryIndex = (tertiaryIndex + 1) % tertiaryImages.length;
    applyTransition(imgTertiary);
    setNewImage(imgTertiary, tertiaryImages[tertiaryIndex], DELAY * 1.5);
  }

  function cycleGroup() {
    const groupImgs = document.querySelectorAll(".image-group img");
    const currentGroup = groupImages[groupSetIndex];

    function applyTransition(element) {
      element.style.transition = "all 0.5s ease-in-out";
      element.style.opacity = "0";
      element.style.transform = "scale(0)";
    }

    function setNewImage(element, newSrc, delay) {
      setTimeout(() => {
        element.src = newSrc;
        setTimeout(() => {
          element.style.opacity = "1";
          element.style.transform = "scale(1.2)";
          setTimeout(() => {
            element.style.transform = "scale(1)";
          }, DELAY);
        }, DELAY);
      }, delay);
    }

    groupImgs.forEach((img, index) => {
      applyTransition(img);
      setNewImage(
        img,
        currentGroup[groupIndices[index]],
        DELAY * (1 + index / 5)
      );
    });

    groupSetIndex = (groupSetIndex + 1) % groupImages.length;
  }

  cycleImages();
  cycleGroup();

  setInterval(cycleGroup, 5000);
  setInterval(cycleImages, 5000);
});

/**
 * SECTION: Top Pets
 */

const container = document.querySelector(".pet-container");
const petRange = document.getElementById("pet-range");
const topPetsHeader = document.querySelector("#top-pets-info img");
const topPetsDesc = document.querySelector("#top-pets-info p");
const animalNameElement = document.getElementById("animal-name");
const animalDescriptionElement = document.getElementById("animal-description");
const visibleCards = container.querySelectorAll(".pet-card:not(.hidden)");
const hiddenCards = container.querySelectorAll(".pet-card.hidden");
const infoCard = document.getElementById("info-card");
const viewAllButton = document.getElementById("view-all");
const closeInfoButton = document.getElementById("close-info");
const prevButton = document.getElementById("prev-animal");
const nextButton = document.getElementById("next-animal");
const backgroundAudio = new Audio(
  "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
);
const savedVolume = localStorage.getItem("backgroundAudioVolume");
if (savedVolume !== null) {
  backgroundAudio.volume = parseFloat(savedVolume);
} else {
  backgroundAudio.volume = 0.1;
}
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
let initialRight = -30;
let maxScrollDistance = 0;
const curtain = document.querySelector("#top-pets .curtain");
let tempcontright;

function calculateMaxScroll() {
  const containerWidth = container.scrollWidth;
  const viewportWidth = window.innerWidth;
  const maxDistance = ((containerWidth - viewportWidth) / viewportWidth) * 100;
  return maxDistance + 5;
}

visibleCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (container.classList.contains("expanded")) return;

    if (index === 0) {
      card.classList.add("scale-up");

      setTimeout(() => {
        card.classList.remove("scale-up");
        container.classList.add("expanded");
        petRange.classList.remove("hidden");
        topPetsDesc.classList.add("hidden");
        viewAllButton.style.display = "none";
        topPetsHeader.style.transform = "translateY(-35vh)";

        petRange.value = 0;
        container.style.right = `${initialRight}%`;

        initialRight = -30;
        maxScrollDistance = calculateMaxScroll();

        hiddenCards.forEach((hiddenCard, idx) => {
          setTimeout(() => {
            hiddenCard.classList.remove("hidden");
          }, idx * 100);
        });
      }, 400);
    }
  });
});

viewAllButton.addEventListener("click", () => {
  setTimeout(() => {
    container.classList.add("expanded");
    petRange.classList.remove("hidden");
    topPetsDesc.classList.add("hidden");
    viewAllButton.style.display = "none";
    topPetsHeader.style.transform = "translateY(-35vh)";

    petRange.value = 0;
    container.style.right = `${initialRight}%`;

    initialRight = -30;
    maxScrollDistance = calculateMaxScroll();

    hiddenCards.forEach((hiddenCard, idx) => {
      setTimeout(() => {
        hiddenCard.classList.remove("hidden");
      }, idx * 100);
    });
  }, 400);
});

petRange.addEventListener("input", (e) => {
  const rangeValue = e.target.value;

  // Normalize the rangeValue to a percentage of max scroll distance
  const normalizedRange = rangeValue / 100; // Converts 0-100 range to 0.0-1.0

  // Calculate the container offset with a consistent rate
  const containerOffset = initialRight - normalizedRange * maxScrollDistance;

  // Apply the calculated offset
  container.style.right = `${containerOffset}%`;
});

const allCards = document.querySelectorAll(".pet-card");

allCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (container.classList.contains("expanded")) {
      showAnimalInfo(card);
    }
  });
});

closeInfoButton.addEventListener("click", () => {
  resetCarousel();
});

const petDescriptions = {
  PamstIr:
    "The PamstIr is a unique pet that can be used to counter enemy strategies, making it a great choice for a flexible team. <br><br>One of its charming traits is its fondness for food, which aligns with its playful demeanor and enhances its interactions within the game. <br><br> Players often enjoy incorporating the PamstIr into their teams for its fun mechanics and the delightful chaos it brings to battles.",
  eagSVle:
    "The eagSVle has a powerful ability, which makes it a great choice for a summoning-based strategy. <br><br>With its keen eye for spotting opportunities, the eagSVle can turn the tide of battle in your favor, making it a favored choice for players looking to build a reliable and synergistic team. <br><br>Whether soaring high above or diving into action, the eagSVle embodies determination and teamwork, ensuring that your pets are always ready for the challenge ahead.",
  YenguiK:
    "The YenguiK is a scaling pet, which is an excellent choice for longer games where scaling is essential. <br><br>With its relaxed demeanor and strategic support, the YenguiK is perfect for players who enjoy a more methodical approach to battles. <br><br>Whether it's lounging on a snowy landscape or rallying its fellow pets for a well-deserved rest, the YenguiK adds a fun and whimsical element to your team, proving that sometimes, taking a break is the best strategy!",
  VandaJ:
    "The VandaJ is a versatile pet, which makes it a great choice for scaling early to mid-game, helping to keep your team strong. <br><br>Its thoughtful nature encourages players to build a well-rounded team, making the VandaJ an essential addition for those who enjoy a more cerebral approach to battles. <br><br>With its endearing personality and supportive role, the VandaJ not only adds fun to your lineup but also proves that knowledge is power.",
  MSeer:
    "The MSeer is a high-impact support pet, known for its ability to deal significant damage with its 'Attack' ability. <br><br>The MSeer's no-nonsense attitude encourages players to think critically about their team composition and tactics, making it an excellent choice for those who thrive on discipline and precision.  <br><br>With its strong presence on the battlefield, the MSeer not only brings a sense of authority but also fosters a cohesive team dynamic, proving that sometimes, a firm approach is the key to victory.",
};

let isShowingAnimal = false;

function showAnimalInfo(card) {
  if (isShowingAnimal) return;
  isShowingAnimal = true;
  const image = card.querySelector("img");
  const animalName = image.alt;

  setTimeout(() => {
    image.classList.add("move-down");
    const curtain = document.querySelector("#top-pets .curtain");
    curtain.style.transform = "translateY(-1px)";
    setTimeout(() => {
      curtain.style.backgroundImage =
        window.getComputedStyle(card).backgroundImage;
      curtain.style.backgroundSize = "cover";
      card.style.backgroundImage = "none";
      card.style.overflow = "visible";
      topPetsHeader.classList.add("hidden");
      petRange.classList.add("hidden");

      const allCards = Array.from(document.querySelectorAll(".pet-card"));
      console.log(allCards);
      allCards.forEach((c) => {
        if (c !== card) {
          c.classList.add("showandtellhidden");
        }
      });

      setTimeout(() => {
        allCards.forEach((c) => {
          if (c !== card) {
            c.style.transition = "opacity 0.8s ease-in-out";
            c.style.opacity = "0";
          }
        });
        setTimeout(() => {
          const containerRightOffset = parseFloat(container.style.right) || 0;

          const cardRect = card.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const offsetX =
            cardRect.left - containerRect.left - containerRightOffset - 45;
          const offsetY = cardRect.top - containerRect.top + 50;

          card.style.transition = "none";
          container.style.transition = "none";

          card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

          card.offsetHeight;
          container.offsetHeight;
          tempcontright = container.style.right;
          container.style.right = ``;
          console.log(tempcontright);
          card.style.transition = "all 0.8s ease-in-out";
          container.style.transition = "all 0.8s ease-in-out";
          card.style.transform = "translate(0, 0)";
          card.classList.add("showandtell");
          image.classList.remove("move-down");
          animalNameElement.textContent = animalName;
          animalDescriptionElement.innerHTML =
            petDescriptions[animalName] || "No description available.";
          infoCard.classList.remove("hidden", "hide");
          void infoCard.offsetWidth;
          infoCard.classList.add("show");
          setTimeout(() => {
            allCards.forEach((c) => {
              if (c !== card) {
                c.classList.add("hidden");
              }
            });
          }, 800);
        }, 1000);
      }, 50);
    }, 100);
  }, 500);
}

function resetCarousel() {
  const allCards = document.querySelectorAll(".pet-card");
  const shownCard = document.querySelector(".pet-card.showandtell");
  setTimeout(() => {
    infoCard.classList.remove("show");
    infoCard.classList.add("hide");
    infoCard.classList.add("hidden");
    curtain.style.transform = "translateY(-100%)";
    if (shownCard) {
      shownCard.style.transition = "opacity 0.8s ease-in-out";
      shownCard.style.opacity = "0";
      isShowingAnimal = false;
    }
    setTimeout(() => {
      curtain.style.backgroundImage = "";
      setTimeout(() => {
        container.style.transform = "translateY(20px)";
        container.style.opacity = "0";
        container.style.right = tempcontright;
        topPetsHeader.classList.remove("hidden");
        setTimeout(() => {
          allCards.forEach((card) => {
            card.classList.remove("hidden", "showandtell", "showandtellhidden");
            card.style.opacity = "1";
            card.style.transform = "";
            card.style.transition = "";
            card.style.backgroundImage = "";
            card.style.overflow = "";
          });
          container.style.transform = "translateY(0)";
          container.style.opacity = "1";
        }, 500);
      }, 0);
      petRange.classList.remove("hidden");
      infoCard.classList.add("hidden");
      document.getElementById("top-pets").style.backgroundImage =
        "url('../assets/maps/Field.webp')";
    }, 800);
  }, 300);
}

/**
 * SECTION: Trailer
 */

let popup = document.querySelector(".popup-video");
let video = document.querySelector("#video-play");

document
  .getElementById("play-video-btn")
  .addEventListener("click", function () {
    popup.classList.remove("hidden");
    video.currentTime = 0;
    video.play();
    backgroundAudio.pause();
  });

popup.addEventListener("click", function () {
  popup.classList.add("hidden");
  video.pause();
  backgroundAudio.play();
});

window.onload = function () {
  localStorage.removeItem("ingame");
  const track = document.getElementById("maps");

  const backbtn = document.getElementById("backArrow");
  backbtn.addEventListener("click", function () {
    const menuPath = path.join(appDir, "menu/menu.html");
    window.location.href = `file://${menuPath}`;
  });
  track.dataset.percentage = "-30";
  track.style.transform = `translate(-30%, -50%)`;

  const username = localStorage.getItem("username").split(" ")[0];
  const logged = localStorage.getItem("loggedin");
  const el = document.querySelector("#typewriter");
  if (logged) {
  } else {
    function clearLocalStorageExceptUsers() {
      const keysToKeep = ["users"];

      const allKeys = Object.keys(localStorage);

      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }

    clearLocalStorageExceptUsers();

    const loginPath = path.join(appDir, "login/index.html");
    window.location.href = `file://${loginPath}`;
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

  const socialMediaSection = document.querySelector(".social-media");

  const instagram = document.querySelector(".instagram");
  const twitter = document.querySelector(".twitter");
  const steam = document.querySelector(".steam");
  const facebook = document.querySelector(".facebook");
  const discord = document.querySelector(".discord");

  const allIcons = [instagram, twitter, steam, facebook, discord];
  let completedAnimations = 0;

  // Disable tooltips initially
  document
    .querySelectorAll(".tooltip")
    .forEach((el) => el.classList.add("tooltip-disabled"));

  // Observer to start the animations
  const socialMediaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          allIcons.forEach((icon) => icon.classList.add("walk"));
        }
      });
    },
    { threshold: 0.5 }
  );

  // Listen for the end of animations
  allIcons.forEach((icon) => {
    icon.addEventListener("animationend", () => {
      completedAnimations += 1;
      if (completedAnimations === allIcons.length) {
        // Enable tooltips after all animations have completed
        document
          .querySelectorAll(".tooltip")
          .forEach((el) => el.classList.remove("tooltip-disabled"));
      }
    });
  });

  socialMediaObserver.observe(socialMediaSection);

  let liber = "../assets/Animals/Liberian_Husky.webp";

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
    { element: document.querySelector(".trailer"), animal: liber },
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
};
