

document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("username");
  localStorage.removeItem("coins");
  localStorage.removeItem("ownedAnimals");
  window.location.href = "/login/start.html";
});

window.onload = function () {
  const logoutButton = document.querySelector(".logout-button");
  const threeDots = document.querySelector(".three-dots");

  threeDots.addEventListener("mouseenter", function () {
    logoutButton.classList.add("show"); // Show the button
  });

  threeDots.addEventListener("mouseleave", function () {
    logoutButton.classList.remove("show"); // Hide the button
  });
};

