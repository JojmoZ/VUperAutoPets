document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");
  const loadingFill = document.getElementById("loading-fill");
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const totalGameTime = 15 * 1000;
  const startTime = Date.now();
  let score = 0;
  let circles = [];
  let isHolding = false;
  let activeDragCircle = null;
  let isDragging = false;
  let isGameRunning = false;
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Circle {
    constructor(x, y, radius, type = "normal") {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.maxRadius = radius;
      this.minRadius = 25;
      this.innerRadius = 25;
      this.speed = Math.random() * (0.5 - 0.3) + 0.3;
      this.shrinking = true;
      this.type = type;
      this.dragStartX = null;
      this.dragStartY = null;
      this.dragEndX = null;
      this.dragEndY = null;
      this.isDragCompleted = false;
      this.dragProgress = 0;
      this.isMoving = false;
      this.wasClicked = false;

      if (this.type === "drag") {
        this.moveSpeed = Math.random() * (0.004 - 0.001) + 0.001;
      }
    }
    setDragPath(startX, startY, endX, endY) {
      this.dragStartX = startX;
      this.dragStartY = startY;
      this.dragEndX = endX;
      this.dragEndY = endY;
    }

    draw() {
      if (this.type === "normal") {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
        ctx.fill();
        ctx.closePath();
      } else if (this.type === "drag") {
        ctx.beginPath();
        ctx.moveTo(this.dragStartX, this.dragStartY);
        ctx.lineTo(this.dragEndX, this.dragEndY);
        ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        const currentX =
          this.dragStartX +
          this.dragProgress * (this.dragEndX - this.dragStartX);
        const currentY =
          this.dragStartY +
          this.dragProgress * (this.dragEndY - this.dragStartY);
        ctx.beginPath();
        ctx.arc(currentX, currentY, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(currentX, currentY, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
      }
    }

    update() {
      if (this.type === "normal" && this.shrinking) {
        this.radius -= this.speed;
        if (this.radius <= this.minRadius) {
          this.radius = this.minRadius;
          this.shrinking = false;
          circles = circles.filter((circle) => circle !== this);
        }
      } else if (this.type === "drag") {
        if (this.isMoving) {
          this.dragProgress += this.moveSpeed;
          if (this.dragProgress >= 1) {
            this.isDragCompleted = true;
            score += 5;
            scoreElement.textContent = score;
            circles = circles.filter((circle) => circle !== this);
            isDragging = false;
          }
        } else if (this.shrinking) {
          this.radius -= this.speed;
          if (this.radius <= this.minRadius && !this.wasClicked) {
            circles = circles.filter((circle) => circle !== this);
          }
        }
      }
    }

    startMoving() {
      this.isMoving = true;
    }

    checkDrag(x, y) {
      const currentX =
        this.dragStartX + this.dragProgress * (this.dragEndX - this.dragStartX);
      const currentY =
        this.dragStartY + this.dragProgress * (this.dragEndY - this.dragStartY);
      const distance = Math.sqrt((x - currentX) ** 2 + (y - currentY) ** 2);
      return distance < 50;
    }

    clicked(x, y) {
      if (this.type === "normal") {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
      } else if (this.type === "drag") {
        const distance = Math.sqrt(
          (x - this.dragStartX) ** 2 + (y - this.dragStartY) ** 2
        );
        return distance <= this.radius && !this.isMoving;
      }
      return false;
    }

    calculateScore() {
      const remainingRadius = this.radius - this.minRadius;
      if (remainingRadius < 10) {
        return 3;
      } else if (remainingRadius < 25) {
        return 1;
      }
      return 0;
    }
  }
  function generateCircle() {
     if (isDragging || !isGameRunning) return;

    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;

    if (Math.random() < 0.2) {
      const dragEndX = Math.random() * (canvas.width - 100) + 50;
      const dragEndY = Math.random() * (canvas.height - 100) + 50;
      const newDragCircle = new Circle(x, y, 75, "drag");
      newDragCircle.setDragPath(x, y, dragEndX, dragEndY);
      circles.push(newDragCircle);
    } else {
      const newCircle = new Circle(x, y, 75, "normal");
      circles.push(newCircle);
    }
  }
  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let normalCircleClicked = false;

    circles.forEach((circle) => {
      if (circle.type === "normal" && circle.clicked(x, y)) {
        score += circle.calculateScore();
        scoreElement.textContent = score;
        circles = circles.filter((c) => c !== circle);
        normalCircleClicked = true;
      } else if (circle.type === "drag" && circle.clicked(x, y)) {
        isHolding = true;
        isDragging = true;
        activeDragCircle = circle;
        activeDragCircle.wasClicked = true;
        activeDragCircle.startMoving();
      }
    });

    if (normalCircleClicked) {
      isHolding = false;
      activeDragCircle = null;
    }
  });
  canvas.addEventListener("mousemove", (event) => {
    if (!isHolding || !activeDragCircle) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (!activeDragCircle.checkDrag(x, y)) {
      circles = circles.filter((circle) => circle !== activeDragCircle);
      isHolding = false;
      activeDragCircle = null;
      isDragging = false;
    }
  });
  canvas.addEventListener("mouseup", () => {
    if (isHolding && activeDragCircle) {
      circles = circles.filter((circle) => circle !== activeDragCircle);
    }
    isHolding = false;
    activeDragCircle = null;
    isDragging = false;
  });

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle) => {
      circle.update();
      circle.draw();
    });

    requestAnimationFrame(gameLoop);
  }
  let circleInterval = setInterval(generateCircle, totalGameTime / 15);

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;

    layers.forEach((layer) => {
      const speed = layer.getAttribute("data-speed");
      const movement = -((scrollTop * speed) / 100);
      layer.style.transform = `translate3d(0px, ${movement}px, 0px)`;
    });
  });

  function updateLoading() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min((elapsedTime / totalGameTime) * 100, 100);
    loadingFill.style.width = `${progress}%`;

    if (elapsedTime >= totalGameTime) {
      clearInterval(circleInterval);
      window.location.href = "/game/index.html";
    }
  }

  setInterval(updateLoading, 100);
  gameLoop();
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;

    layers.forEach((layer) => {
      const speed = layer.getAttribute("data-speed");
      const movement = -((scrollTop * speed) / 100);
      layer.style.transform = `translate3d(0px, ${movement}px, 0px)`;
    });
  });

  // IntersectionObserver to detect if game section is visible
  const gameSection = document.querySelector(".main-content");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // When the game section is visible
          isGameRunning = true;
          circleInterval = setInterval(generateCircle, totalGameTime / 15);
        } else {
          // When the game section is not visible
          isGameRunning = false;
          clearInterval(circleInterval);
        }
      });
    },
    { threshold: 0.5 } // Adjust the threshold if needed
  );

  // Observe the game section
  observer.observe(gameSection);
});

