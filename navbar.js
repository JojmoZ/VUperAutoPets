  const logoutButton = document.querySelector(".logout-button");
  const threeDots = document.querySelector(".three-dots");
  let hideTimeout;
  threeDots.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout); 
    logoutButton.classList.remove("hide"); 
    logoutButton.classList.add("show"); 
  });
  threeDots.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(function () {
      logoutButton.classList.remove("show");
      logoutButton.classList.add("hide"); 
    }, 5000); 
  });
  logoutButton.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout); 
    logoutButton.classList.remove("hide");
  });
  logoutButton.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(function () {
      logoutButton.classList.remove("show");
      logoutButton.classList.add("hide");
    }, 5000); 
  });
  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      localStorage.removeItem("username");
      localStorage.removeItem("loggedin");
      localStorage.removeItem("coins");
      localStorage.removeItem("ownedAnimals");
      window.location.href = "/login/start.html";
    });
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll(".navbar-left a");
    navLinks.forEach((link) => {
      if (link.href.includes(currentPage)) {
        link.classList.add("active");
      }
   });

