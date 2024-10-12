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
    registerError.style.display = "none";
    loginError.style.display = "none";
  });

  loginTab.addEventListener("click", () => {
    showForm(loginForm, registrationForm);
    registerError.style.display = "none";
    loginError.style.display = "none";
  });
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
    if (password !== confirmPassword) {
      modalErrorText.innerText = "Passwords do not match.";
      showErrorModal();
      return;
    }
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    
    registrationForm.reset();
    registerError.style.display = "none";

     showSuccessModal();

  });
  function showSuccessModal() {
    const successModal = document.getElementById("successModal");
    const checkmarkCircle = document.querySelector(".checkmark-circle");
    const checkmarkCheck = document.querySelector(".checkmark-check");
    checkmarkCircle.style.strokeDashoffset = "166";
    checkmarkCheck.style.strokeDashoffset = "48";
    successModal.classList.remove("show");
    void successModal.offsetWidth; 
    successModal.style.bottom = "20px";
    setTimeout(() => {
      successModal.classList.add("show");
    }, 10); 
    setTimeout(() => {
      successModal.style.bottom = "-100px";
      successModal.classList.remove("show");
    }, 5000);
  }





  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    if (username === storedUsername && password === storedPassword) {
      window.location.href = "/home/homepage.html";
      localStorage.setItem('loggedin', true);
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
