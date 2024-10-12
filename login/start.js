window.onload = function () {
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

  // Show the registration form initially
  registerTab.classList.add("active");
  registrationForm.classList.add("active");
  registrationForm.style.display = "block";

  // Function to handle smooth form transitions
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

  // Tab switching logic
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

  // Registration logic with validation
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (username === "" || password === "" || confirmPassword === ""){
        modalErrorText.innerHTML = "Please fill all fields"
        showErrorModal();
        return;
    }
    // Check if passwords match
    if (password !== confirmPassword) {
      modalErrorText.innerText = "Passwords do not match.";
      showErrorModal();
      return;
    }

    // Store username and password in localStorage
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    registrationForm.reset();
    registerError.style.display = "none";
  });
  // Login logic with validation
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    // Check if the entered credentials match the stored ones
    if (username === storedUsername && password === storedPassword) {
      alert("Login successful!");
      window.location.href = "/home/homepage.html";
    } else {
      modalErrorText.innerText = "Invalid username or password.";
      showErrorModal();
    }
  });

  // Function to display error modal
  function showErrorModal() {
    errorModal.style.bottom = "20px"; // Slide up from bottom
    setTimeout(() => {
      errorModal.style.bottom = "-100px"; // Hide after 3 seconds
    }, 3000);
  }

  // Initial logo animation on click
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
