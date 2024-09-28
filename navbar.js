const gotoplay = document.getElementById("play-button");
gotoplay.addEventListener("click", function (e) {
  window.location = "/game/index.html";
});


document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("username");
  localStorage.removeItem("coins");
  localStorage.removeItem("ownedAnimals");
  window.location.href = "/login/start.html";
});
