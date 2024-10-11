document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;

    layers.forEach((layer) => {
      const speed = layer.getAttribute("data-speed");
      const movement = -((scrollTop * speed) / 100);
      layer.style.transform = `translate3d(0px, ${movement}px, 0px)`;
    });
  });
});
