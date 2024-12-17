const captchaModal1 = document.getElementById("captchaModal1");
const captchaModal2 = document.getElementById("captchaModal2");


const path = window.electron.path;
const appDir = window.electron.__dirname;
document.addEventListener("mousemove", (event) => {
  const { clientX, clientY } = event;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const xNorm = (clientX / width - 0.5) * 2;
  const yNorm = (clientY / height - 0.5) * 2;

  const layer1 = document.querySelector(".parallax-layer-1");
  const layer2 = document.querySelector(".parallax-layer-2");
  const layer3 = document.querySelector(".parallax-layer-3");
  const layer4Left = document.querySelector(".parallax-layer-4.left");
  const layer4Right = document.querySelector(".parallax-layer-4.right");

  layer1.style.transform = `translate(${xNorm * 8}px, ${yNorm * 8}px)`;
  layer2.style.transform = `translate(${xNorm * 18}px, ${yNorm * 18}px)`;
  layer3.style.transform = `translate(${xNorm * 32}px, ${yNorm * 32}px)`;
  layer4Left.style.transform = `translate(${xNorm * 60}px, ${
    yNorm * 60
  }px) scaleX(-1)`;
  layer4Right.style.transform = `translate(${xNorm * 60}px, ${yNorm * 60}px)`;
});

window.onload = function () {
  localStorage.removeItem("ingame");
  const captchaChallenge = document.getElementById("captchaChallenge");
  const captchaInput = document.getElementById("captchaInput");
  const captchaText = captchaModal1.querySelector(".captcha");
  const reloadBtn = captchaModal1.querySelector(".reload-btn");
  const reloadBtn2 = captchaModal2.querySelector(".reload-btn2");
  const inputField = captchaModal1.querySelector("#captchaInput1");
  const checkBtn = captchaModal1.querySelector(".check-btn");
  const allCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
  let generatedCaptcha1 = "";

  function generateCaptcha1() {
    captchaText.innerText = "";
    for (let i = 0; i < 6; i++) {
      captchaText.innerText += ` ${
        allCharacters[Math.floor(Math.random() * allCharacters.length)]
      }`;
    }
  }

  reloadBtn.addEventListener("click", () => {
    clearCaptcha();
    generateCaptcha1();
  });

  reloadBtn2.addEventListener("click", () => {
    clearCaptcha();
    generateCaptcha2();
  });

  function clearCaptcha() {
    inputField.value = "";
  }

  let generatedCaptcha2 = "";

  function generateCaptcha2() {
    const canvas = document.getElementById("captchaCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    generatedCaptcha2 = Array.from({ length: 5 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");

    ctx.font = "1.875rem Arial";
    ctx.fillStyle = "#000";
    for (let i = 0; i < generatedCaptcha2.length; i++) {
      ctx.save();
      const x = 20 + i * 25;
      const y = 35 + Math.random() * 10;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillText(generatedCaptcha2[i], 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = "#c0c0c0";
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = "#c0c0c0";
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  function showRandomCaptcha() {
    const useCaptcha1 = Math.random() > 0.5;
    const selectedModal = useCaptcha1 ? captchaModal1 : captchaModal2;
    selectedModal.classList.remove("hidden");
    selectedModal.classList.add("show");
    document.body.classList.add("modal-active");
    document.querySelector(".overlay").classList.remove("hidden");
    if (useCaptcha1) {
      generateCaptcha1();
    } else {
      generateCaptcha2();
    }

    return useCaptcha1 ? "captchaModal1" : "captchaModal2";
  }

  function verifyCaptcha(selectedCaptchaModal) {
    if (selectedCaptchaModal === "captchaModal1") {
      const enteredCaptcha = inputField.value.split("").join(" ");
      if (enteredCaptcha === captchaText.innerText) {
        enteredCaptcha.innerHTML = "";
        return true;
      } else {
        modalErrorText.innerText = "Invalid Captcha";
        showErrorModal();
        return false;
      }
    } else if (selectedCaptchaModal === "captchaModal2") {
      const inputCaptcha2 = document.getElementById("captchaInput2").value;
      if (inputCaptcha2 === generatedCaptcha2) {
        hideCaptcha();
        return true;
      } else {
        modalErrorText.innerText = "Invalid Captcha";
        showErrorModal();
        return false;
      }
    }
    return false;
  }

  const logo = document.getElementById("logo");
  const loginCard = document.getElementById("loginCard");
  const startButton = document.getElementById("start-button");
  const turtle = document.getElementById("turtle");
  const parallaxLayersAnimals = document.querySelectorAll(".parallax-layer-4");
  startButton.addEventListener("click", () => {
    parallaxLayersAnimals.forEach((layer) => {
      layer.style.transition = "transform 1s ease-out, opacity 0.5s ease-out";
      layer.style.transform = "translateX(-100vw)";
      layer.style.opacity = "0";
    });
    logo.style.transition = "transform 1s ease-out, opacity 0.5s ease-out";
    logo.style.transform = "translateX(-100vw)";
    logo.style.opacity = "0";
    startButton.style.transition =
      "transform 1s ease-out, opacity 0.5s ease-out";
    startButton.style.transform = "translateX(-100vw)";
    startButton.style.opacity = "0";
    setTimeout(() => {
      showpushing();
    }, 1000);
  });
  const registerTab = document.getElementById("registerTab");
  const loginTab = document.getElementById("loginTab");
  const registrationForm = document.getElementById("registrationForm");
  const loginForm = document.getElementById("loginForm");
  const registerError = document.getElementById("registerError");
  const loginError = document.getElementById("loginError");
  const errorModal = document.getElementById("errorModal");
  const modalErrorText = document.getElementById("modalErrorText");
  let isLoginCardVisible = false;
  showForm(registrationForm, loginForm);
  const logged = localStorage.getItem("loggedin");
  if (logged) {
    const homePath = path.join(appDir, "home/homepage.html"); 
    window.location.href = `file://${homePath}`; 
  }
  registerTab.classList.add("active");
  registrationForm.classList.add("active");
  registrationForm.style.display = "block";

  function showForm(formToShow, formToHide) {
    formToHide.classList.remove("active");
    setTimeout(() => {
      formToHide.style.display = "none";
      formToShow.style.display = "block";
      setTimeout(() => {
        formToShow.classList.add("active");
      }, 20);
    }, 500);
  
    if (formToShow === registrationForm) {
      registerTab.classList.add("hidden");
      setTimeout(() => {
        registerTab.style.display = "none";
        loginTab.style.display = "block";
        setTimeout(() => {
          loginTab.classList.remove("hidden");
        }, 20);
      }, 500);
    } else {
      loginTab.classList.add("hidden");
      setTimeout(() => {
        loginTab.style.display = "none";
        registerTab.style.display = "block";
        setTimeout(() => {
          registerTab.classList.remove("hidden");
        }, 20);
      }, 500);
    }
  }

  registerTab.addEventListener("click", () => {
    showForm(registrationForm, loginForm);
  });

  loginTab.addEventListener("click", () => {
    showForm(loginForm, registrationForm);
  });
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    document.querySelectorAll(".error-message").forEach((error) => {
      error.classList.remove("show");
    });
    const prohibitedUsernames = ["admin", "trainer", "recsel"];
    const isUsernameValid = (username) => {
      return (
        username.length >= 5 &&
        username.length <= 20 &&
        !prohibitedUsernames.includes(username.toLowerCase())
      );
    };

    const isPasswordValid = (password) => {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const noRepeatedChars = !/(.)\1{1,}/.test(password);
      return hasUppercase && hasLowercase && noRepeatedChars;
    };

    if (username === "" || password === "" || confirmPassword === "") {
      modalErrorText.innerHTML = "Please fill all fields";
      showErrorModal();
      return;
    }

    if (!isUsernameValid(username)) {
      showError("username", "Username must be between 5-20 characters long");

      return;
    }

    if (!isPasswordValid(password)) {
      showError(
        "password",
        "Password must have at least one uppercase, one lowercase letter, no 2 repeated characters in a row, and cannot match the username."
      );

      return;
    }

    if (password === username) {
      showError("password", "Password Must not be the same as the username");

      return;
    }

    if (password !== confirmPassword) {
      showError("confirmPassword", "Passwords do not match");
      return;
    }

    const selectedCaptchaModal = showRandomCaptcha();
    captchaModal1.querySelector(".check-btn").onclick = () => {
      if (verifyCaptcha(selectedCaptchaModal))
        registerUser(username, username, password);
    };
    captchaModal2.querySelector("#submitCaptchaBtn2").onclick = () => {
      if (verifyCaptcha(selectedCaptchaModal))
        registerUser(username, username, password);
    };
  });

  async function checkTraineeData(username) {
    try {
      const response = await fetch("https://narcore.apps.binus.ac.id/trainee.json");
      const trainees = await response.json();
      return trainees.some(
        (trainee) =>
          trainee.TraineeCode === username || trainee.TraineeName === username
      );
    } catch (error) {
      console.error("Error loading trainee data:", error);
      return false;
    }
  }
  function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}Error`);
    if (errorElement) {
      errorElement.textContent = message;

      const fullHeight = errorElement.scrollHeight;

      errorElement.style.height = "0";
      errorElement.style.opacity = "0";
      errorElement.style.transform = "translateY(-10px)";

      void errorElement.offsetHeight;

      errorElement.style.height = `${fullHeight}px`;
      errorElement.style.opacity = "1";
      errorElement.style.transform = "translateY(3)";

      setTimeout(() => {
        errorElement.style.height = "auto";
      }, 300);

      setTimeout(() => {
        hideError(inputId);
      }, 5000);
    }
  }

  function hideError(inputId) {
    const errorElement = document.getElementById(`${inputId}Error`);
    if (errorElement) {
      const currentHeight = errorElement.scrollHeight;

      errorElement.style.height = `${currentHeight}px`;

      void errorElement.offsetHeight;

      errorElement.style.height = "0";
      errorElement.style.opacity = "0";
      errorElement.style.transform = "translateY(-10px)";

      setTimeout(() => {
        errorElement.style.height = "0";
      }, 300);
    }
  }

  async function registerTrainee(displayName, username, password) {
    hideCaptcha();

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((user) => user.username === username)) {
      modalErrorText.innerText = "User already exists.";
      showErrorModal();
      return;
    }

    let key = await generateKey();

    const rawKey = await crypto.subtle.exportKey("raw", key.cryptoKey);

    let encryptedPassword = await encrypt(password, key);

    users.push({
      displayName: displayName,
      username: username,
      password: {
        encrypted: Array.from(new Uint8Array(encryptedPassword)),
        key: Array.from(new Uint8Array(rawKey)),
        iv: Array.from(key.iv),
      },
      coins: 15,
      ownedAnimals: [],
    });

    localStorage.setItem("users", JSON.stringify(users));

    registrationForm.reset();
    registerError.style.display = "none";
    if (displayName != username) {
      loginUser(username, password);
    }
    showSuccessModal();
    showForm(loginForm, registrationForm);
  }
  async function registerUser(displayName, username, password) {
    const traineeExists = await checkTraineeData(username);
    if (traineeExists) {
      modalErrorText.innerText = "User already exists.";
      showErrorModal();
      return;
    }
    hideCaptcha();

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((user) => user.username === username)) {
      modalErrorText.innerText = "User already exists.";
      showErrorModal();
      return;
    }

    let key = await generateKey();

    const rawKey = await crypto.subtle.exportKey("raw", key.cryptoKey);

    let encryptedPassword = await encrypt(password, key);

    users.push({
      displayName: displayName,
      username: username,
      password: {
        encrypted: Array.from(new Uint8Array(encryptedPassword)),
        key: Array.from(new Uint8Array(rawKey)),
        iv: Array.from(key.iv),
      },
      coins: 15,
      ownedAnimals: [],
    });

    localStorage.setItem("users", JSON.stringify(users));

    registrationForm.reset();
    registerError.style.display = "none";
    if (displayName != username) {
      loginUser(username, password);
    }
    showSuccessModal();
    showForm(loginForm, registrationForm);
  }

  async function generateKey() {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cryptoKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    return { cryptoKey, iv };
  }

  async function encrypt(data, key) {
    const encodedData = new TextEncoder().encode(data);
    return await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: key.iv },
      key.cryptoKey,
      encodedData
    );
  }

  async function decrypt(encryptedData, key) {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: key.iv },
      key.cryptoKey,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  }

  function showSuccessModal() {
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
    errorModal.style.bottom = "-100px";
    const successModalHTML = `
        <div id="successModal">
            <div class="modal-content">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" style="stroke-dasharray: 166; stroke-dashoffset: 166;" />
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style="stroke-dasharray: 48; stroke-dashoffset: 48;" />
                </svg>
                <p id="modalSuccessText">Registration Successful!</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", successModalHTML);
    const successModal = document.getElementById("successModal");
    const checkmarkCircle = successModal.querySelector(".checkmark-circle");
    const checkmarkCheck = successModal.querySelector(".checkmark-check");
    successModal.style.position = "fixed";
    successModal.style.bottom = "-100px";
    successModal.style.left = "50%";
    successModal.style.transform = "translateX(-50%)";
    successModal.style.backgroundColor = "#4CAF50";
    successModal.style.color = "white";
    successModal.style.width = "300px";
    successModal.style.textAlign = "center";
    successModal.style.padding = "15px";
    successModal.style.borderRadius = "10px";
    successModal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    successModal.style.transition = "all 0.5s ease";
    void successModal.offsetWidth;
    setTimeout(() => {
      successModal.style.bottom = "20px";
      checkmarkCircle.style.transition = "stroke-dashoffset 1.5s ease-in-out";
      checkmarkCheck.style.transition = "stroke-dashoffset 1s ease-in-out 1.5s";
      checkmarkCircle.style.strokeDashoffset = "0";
      checkmarkCheck.style.strokeDashoffset = "0";
    }, 10);
    setTimeout(() => {
      successModal.style.bottom = "-100px";
      setTimeout(() => successModal.remove(), 500);
    }, 5000);
  }

  const toggleButtons = document.querySelectorAll(".toggle-password");
  toggleButtons.forEach((button) => {
    const targetInput = document.getElementById(button.dataset.target);

    button.style.visibility = "hidden";
    targetInput.addEventListener("input", () => {
      if (targetInput.value) {
        button.style.visibility = "visible";
      } else {
        button.style.visibility = "hidden";
      }
    });
    button.addEventListener("click", () => {
      const img = button.querySelector("img");

      if (targetInput.type === "password") {
        targetInput.type = "text";
        img.src = "../assets/login/hide.png";
      } else {
        targetInput.type = "password";
        img.src = "../assets/login/eye.png";
      }
    });
  });
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;
    loginUser(username, password);
  });

  async function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find((user) => user.username === username);
    if (!user) {
      try {
        const response = await fetch(
          "https://narcore.apps.binus.ac.id/trainee.json"
        );
        const trainees = await response.json();

        const trainee = trainees.find(
          (trainee) =>
            trainee.TraineeCode === username &&
            trainee.TraineePassword === password
        );

        if (trainee) {
          registerTrainee(
            trainee.TraineeName,
            trainee.TraineeCode,
            trainee.TraineePassword
          );
        }
      } catch (error) {
        console.error("Error loading trainee data:", error);
      }
      modalErrorText.innerText = "Invalid username or password.";
      showErrorModal();
      return;
    }

    const rawKey = new Uint8Array(user.password.key);
    const iv = new Uint8Array(user.password.iv);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedPassword = await decrypt(
      new Uint8Array(user.password.encrypted),
      { cryptoKey, iv }
    );

    if (decryptedPassword === password) {
      localStorage.setItem("loggedin", true);
      localStorage.setItem("username", user.displayName);
      localStorage.setItem("coins", user.coins);
      localStorage.setItem("ownedAnimals", JSON.stringify(user.ownedAnimals));
      const menuPath = path.join(appDir, "menu/menu.html"); 
      window.location.href = `file://${menuPath}`; 
    } else {
      modalErrorText.innerText = "Invalid username or password.";
      showErrorModal();
    }
  }

  function showErrorModal() {
    const successModal = document.getElementById("successModal");
    if (successModal) {
      successModal.style.bottom = "-100px";
      setTimeout(() => successModal.remove(), 500);
    }
    errorModal.style.bottom = "20px";
    setTimeout(() => {
      errorModal.style.bottom = "-100px";
    }, 3000);
  }

  function showpushing() {
    loginCard.classList.add("centered");

    setTimeout(() => {
      turtle.classList.add("pushing");
    }, 540);

    setTimeout(() => {
      turtle.classList.remove("pushing");
      turtle.style.transform = "scaleX(-1)";
    }, 3000 + 500);

    setTimeout(() => {
      turtle.classList.add("offscreen");
    }, 3000 + 500 + 500);
  }

  function hideturtle() {
    turtle.classList.remove("pushing", "offscreen");
    turtle.style.transform = "scaleX(1)";
    loginCard.classList.remove("centered");
  }

  const backgroundAudio = new Audio(
    "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
  );

  backgroundAudio.volume = 0.08;
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
};

function hideCaptcha() {
  captchaModal1.classList.add("hide");
  captchaModal2.classList.add("hide");

  document.body.classList.remove("modal-active");
  document.querySelector(".overlay").classList.add("hidden");

  setTimeout(() => {
    captchaModal1.classList.add("hidden");
    captchaModal1.classList.remove("show", "hide");
    captchaModal2.classList.add("hidden");
    captchaModal2.classList.remove("show", "hide");
  }, 500);
}
