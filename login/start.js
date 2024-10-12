window.onload = function () {
  const logo = document.getElementById("logo");
  const loginCard = document.getElementById("loginCard");
  const registerTab = document.getElementById("registerTab");
  const loginTab = document.getElementById("loginTab");
  const registrationForm = document.getElementById("registrationForm");
  const loginForm = document.getElementById("loginForm");
  const registerError = document.getElementById("registerError");
  const loginError = document.getElementById("loginError");

  // Show the registration form initially
  registerTab.classList.add("active");
  registrationForm.classList.add("active");
  registrationForm.style.display = "block";

  // Function to handle smooth form transitions
  function showForm(formToShow, formToHide) {
    // Fade out the current form
    formToHide.classList.remove("active");

    // After a short delay, fade in the new form
    setTimeout(() => {
      formToHide.style.display = "none"; // Hide the old form

      // Display the new form with fade-in effect
      formToShow.style.display = "block";
      setTimeout(() => {
        formToShow.classList.add("active");
      }, 20); // Ensure class is added after display change
    }, 500); // Match the CSS transition time
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

  // Registration logic
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      registerError.innerHTML = "Passwords do not match.";
      registerError.style.display = "block";
      return;
    }

    // Store username and password in localStorage
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    alert("Registration successful! You can now log in.");
    registrationForm.reset();
    registerError.style.display = "none";
  });

  // Login logic
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    if (username === storedUsername && password === storedPassword) {
      alert("Login successful!");
      window.location.href = "/home/homepage.html";
    } else {
      loginError.innerHTML = "Invalid username or password.";
      loginError.style.display = "block";
    }
  });

  // Initial logo animation on click
  logo.addEventListener("click", function () {
    logo.style.left = "5%";
    logo.style.transform = "translateX(0)";
    logo.style.width = "50vw"; // Shrink the logo

    setTimeout(() => {
      loginCard.classList.add("active");
    }, 1000); // Delay matches the logo movement
  });
};
