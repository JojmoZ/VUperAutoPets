
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const color = card.getAttribute("data-color");
    card.style.setProperty("--primary-color", color);
  });
});