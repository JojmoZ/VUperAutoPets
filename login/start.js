window.onload = function () {
  const captchaChallenge = document.getElementById("captchaChallenge");
  const captchaInput = document.getElementById("captchaInput");
  const captchaError = document.getElementById("captchaError");

  // Function to generate a random CAPTCHA
  function generateCaptcha() {
    const operators = ["+", "-", "*"]; // You can choose the operators you like
    const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let captcha;
    if (operator === "+") captcha = num1 + num2;
    else if (operator === "-") captcha = num1 - num2;
    else if (operator === "*") captcha = num1 * num2;

    captchaChallenge.textContent = `${num1} ${operator} ${num2}`;
    return captcha;
  }

  let generatedCaptcha = generateCaptcha(); // Store the generated CAPTCHA result
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

  // Function to show form
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

  // Tab switching
  registerTab.addEventListener("click", () => {
    showForm(registrationForm, loginForm);
    registerError.style.display = "none";
    loginError.style.display = "none";
  });

  loginTab.addEventListener("click", () => {
    showForm(loginForm, registrationForm);
    registerError.style.display = "none";
    loginError.style.display = "none";
  });

  // Registration Form Submission
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

    // Retrieve the stored users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the username already exists
    if (users.some((user) => user.username === username)) {
      modalErrorText.innerText = "Username already exists.";
      showErrorModal();
      return;
    }

    // Add new user to the users array
    users.push({
      username: username,
      password: password,
      coins: 15,
      ownedAnimals:[]});

    // Save the updated users array back to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Clear form and reset captcha
    registrationForm.reset();
    registerError.style.display = "none";
    captchaError.textContent = "";
    generatedCaptcha = generateCaptcha();

    // Show success modal
    showSuccessModal();
  });

  // Generate the first captcha
  generatedCaptcha = generateCaptcha();

  // Success modal
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

  // Login Form Submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    // Retrieve the users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username and password match a stored user
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

  // Handle logo click for login card animation
  logo.addEventListener("click", function () {
    if (isLoginCardVisible) {
      logo.style.left = "50%";
      logo.style.transform = "translateX(-50%)";
      loginCard.classList.remove("active");
      setTimeout(() => {
        loginCard.style.opacity = "0";
      }, 500);
      isLoginCardVisible = false;
    } else {
      logo.style.left = "30%";
      logo.style.transform = "translateX(0)";
      setTimeout(() => {
        loginCard.classList.add("active");
        loginCard.style.opacity = "1";
      }, 1000);
      isLoginCardVisible = true;
    }
  });
};
