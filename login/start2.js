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

window.onload = function () {
  const captchaChallenge = document.getElementById("captchaChallenge");
  const captchaInput = document.getElementById("captchaInput");
  const captchaModal1 = document.getElementById("captchaModal1");
  const captchaModal2 = document.getElementById("captchaModal2");
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

    ctx.font = "30px Arial";
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
  const registerTab = document.getElementById("registerTab");
  const loginTab = document.getElementById("loginTab");
  const registrationForm = document.getElementById("registrationForm");
  const loginForm = document.getElementById("loginForm");
  const registerError = document.getElementById("registerError");
  const loginError = document.getElementById("loginError");
  const errorModal = document.getElementById("errorModal");
  const modalErrorText = document.getElementById("modalErrorText");
  let isLoginCardVisible = false;
  const logged = localStorage.getItem("loggedin");
  if (logged) {
    window.location.href = "/home/homepage.html";
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
    if (username === "" || password === "" || confirmPassword === "") {
      modalErrorText.innerHTML = "Please fill all fields";
      showErrorModal();
      return;
    }
    if (password !== confirmPassword) {
      modalErrorText.innerText = "Passwords do not match.";
      showErrorModal();
      return;
    }
    const selectedCaptchaModal = showRandomCaptcha();
    captchaModal1.querySelector(".check-btn").onclick = () => {
      if (verifyCaptcha(selectedCaptchaModal)) registerUser(username, password);
    };
    captchaModal2.querySelector("#submitCaptchaBtn2").onclick = () => {
      if (verifyCaptcha(selectedCaptchaModal)) registerUser(username, password);
    };
  });
 async function registerUser(username, password) {
   hideCaptcha();

   // Retrieve the list of users from localStorage
   let users = JSON.parse(localStorage.getItem("users")) || [];

   // Check if the username already exists
   if (users.some((user) => user.username === username)) {
     modalErrorText.innerText = "Username already exists.";
     showErrorModal();
     return;
   }

   // Generate the encryption key and IV
   let key = await generateKey();

   // Export the raw key
   const rawKey = await crypto.subtle.exportKey("raw", key.cryptoKey);

   // Encrypt the password
   let encryptedPassword = await encrypt(password, key);

   // Save the encrypted password, raw key, and IV in localStorage
   users.push({
     username: username,
     password: {
       encrypted: Array.from(new Uint8Array(encryptedPassword)), // Convert to a storable format
       key: Array.from(new Uint8Array(rawKey)), // Save the raw key as an array
       iv: Array.from(key.iv), // Save the IV to decrypt later
     },
     coins: 15,
     ownedAnimals: [],
   });

   localStorage.setItem("users", JSON.stringify(users));

   // Reset the registration form
   registrationForm.reset();
   registerError.style.display = "none";

   // Show the success modal and switch to the login form
   showSuccessModal();
   showForm(loginForm, registrationForm);
 }


  async function generateKey() {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
    const cryptoKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 }, // AES-GCM with a 256-bit key
      true, // Extractable (can be exported)
      ["encrypt", "decrypt"] // Usages
    );
    return { cryptoKey, iv };
  }
  async function encrypt(data, key) {
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: key.iv },
      key.cryptoKey,
      encodedData
    );
    return encrypted;
  }

  // Decryption Example with AES
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
        img.src = "../assets/hide.png";
      } else {
        targetInput.type = "password";
        img.src = "../assets/eye.png";
      }
    });
  });
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;
    loginUser(username,password)
    // let key = await generateKey();
    // password = await decrypt(password,key)
    // const users = JSON.parse(localStorage.getItem("users")) || [];

    // const user = users.find(
    //   (user) => user.username === username && user.password === password
    // );

    // if (user) {
    //   localStorage.setItem("loggedin", true);
    //   localStorage.setItem("username", user.username);
    //   localStorage.setItem("coins", user.coins);
    //   localStorage.setItem("ownedAnimals", JSON.stringify(user.ownedAnimals));

    //   window.location.href = "/home/homepage.html";
    // } else {
    //   modalErrorText.innerText = "Invalid username or password.";
    //   showErrorModal();
    // }
  });
async function loginUser(username, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Find the user with the given username
  const user = users.find((user) => user.username === username);

  if (!user) {
    modalErrorText.innerText = "Invalid username or password.";
    showErrorModal();
    return;
  }

  // Reconstruct the key and IV
  const rawKey = new Uint8Array(user.password.key); // Retrieve the saved raw key
  const iv = new Uint8Array(user.password.iv); // Retrieve the saved IV

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey, // Use the raw key data
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // Decrypt the stored password
  const decryptedPassword = await decrypt(
    new Uint8Array(user.password.encrypted),
    { cryptoKey, iv }
  );

  // Compare the decrypted password with the entered password
  if (decryptedPassword === password) {
    localStorage.setItem("loggedin", true);
    localStorage.setItem("username", user.username);
    localStorage.setItem("coins", user.coins);
    localStorage.setItem("ownedAnimals", JSON.stringify(user.ownedAnimals));
    window.location.href = "/home/homepage.html";
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

  const turtle = document.getElementById("turtle");
  const logoHeight = document.querySelector(".logocontop").offsetHeight;
  window.addEventListener("scroll", function () {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollY + windowHeight >= bodyHeight) {
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
    } else {
      turtle.classList.remove("pushing", "offscreen");
      turtle.style.transform = "scaleX(1)";
      loginCard.classList.remove("centered");
    }
  });
    const backgroundAudio = new Audio(
      "../assets/sound/Super Auto Pets  - Menu Theme.mp3"
    );
    backgroundAudio.volume = 0.08;
    backgroundAudio.loop = true;

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
