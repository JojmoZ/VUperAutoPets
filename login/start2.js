window.onload = function () {
  const captchaChallenge = document.getElementById("captchaChallenge");
  const captchaInput = document.getElementById("captchaInput");
  const captchaError = document.getElementById("captchaError");
  function generateCaptcha() {
    const operators = ["+", "-", "*"];
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let captcha;
    if (operator === "+") captcha = num1 + num2;
    else if (operator === "-") captcha = num1 - num2;
    else if (operator === "*") captcha = num1 * num2;

    captchaChallenge.textContent = `${num1} ${operator} ${num2}`;
    return captcha;
  }

  let generatedCaptcha = generateCaptcha();
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
    const captchaAnswer = parseInt(captchaInput.value, 10);

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
    if (captchaAnswer !== generatedCaptcha) {
      modalErrorText.innerHTML = "Captcha Incorrect";
      showErrorModal();
      return;
    }
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some((user) => user.username === username)) {
      modalErrorText.innerText = "Username already exists.";
      showErrorModal();
      return;
    }
    users.push({
      username: username,
      password: password,
      coins: 15,
      ownedAnimals: [],
    });
    localStorage.setItem("users", JSON.stringify(users));
    registrationForm.reset();
    registerError.style.display = "none";
    captchaError.textContent = "";
    generatedCaptcha = generateCaptcha();
    showSuccessModal();
    showForm(loginForm, registrationForm);
  });
  generatedCaptcha = generateCaptcha();
  function showSuccessModal() {
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
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
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      localStorage.setItem("loggedin", true);
      localStorage.setItem("username", user.username);
      localStorage.setItem("coins", user.coins);
      localStorage.setItem("ownedAnimals", JSON.stringify(user.ownedAnimals));

      window.location.href = "/home/homepage.html";
    } else {
      modalErrorText.innerText = "Invalid username or password.";
      showErrorModal();
    }
  });

  function showErrorModal() {
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
      // Step 1: Start moving the login card to the center
      loginCard.classList.add("centered");

      // Step 2: After a short delay, make the turtle appear and "push" the card
      setTimeout(() => {
        turtle.classList.add("pushing");
      }, 520);

      // Step 3: After the login card reaches the center, wait 500ms, then mirror the turtle
      setTimeout(() => {
        turtle.classList.remove("pushing");
        turtle.style.transform = "scaleX(-1)"; // Mirror the turtle
      }, 3000 + 500); // 500ms delay after pushing

      // Step 4: After another 500ms, make the turtle move off-screen with the jump effect
      setTimeout(() => {
        turtle.classList.add("offscreen");
      }, 3000 + 500 + 500); // Additional 500ms delay after mirroring
    } else {
      // Reset positions if the user scrolls back up
      turtle.classList.remove("pushing", "offscreen");
      turtle.style.transform = "scaleX(1)"; // Reset the mirror effect
      loginCard.classList.remove("centered");
    }
  });
};
