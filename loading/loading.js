document.addEventListener("DOMContentLoaded", () => {
  const layers = document.querySelectorAll(".parallax-layer");
  const loadingFill = document.getElementById("loading-fill");
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const totalGameTime = 60 * 1000; // 60 seconds
  const startTime = Date.now();
  let score = 0;
  let circles = [];
  let isHolding = false;
  let activeDragCircle = null; // Store the currently active drag circle
  let isDragging = false; // Flag to control whether new circles should be generated

  // Resize canvas to fill the container
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Circle object with outer shrinking animation and static inner circle
  class Circle {
    constructor(x, y, radius, type = "normal") {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.maxRadius = radius;
      this.minRadius = 25;
      this.innerRadius = 25;
      this.speed = 0.3; // Adjust speed to make shrinking slower/faster
      this.shrinking = true;
      this.type = type;
      this.dragStartX = null;
      this.dragStartY = null;
      this.dragEndX = null;
      this.dragEndY = null;
      this.isDragCompleted = false;
      this.dragProgress = 0; // Progress along the drag path (0 to 1)
      this.isMoving = false; // Whether the drag circle is moving
      this.wasClicked = false; // Check if the slider was clicked during the shrinking phase
    }

    // For dragging interaction, set the drag path
    setDragPath(startX, startY, endX) {
      this.dragStartX = startX;
      this.dragStartY = startY;
      this.dragEndX = endX;
    }

    draw() {
      if (this.type === "normal") {
        // Draw outer circle (shrinking)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Draw inner circle (static)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
        ctx.fill();
        ctx.closePath();
      } else if (this.type === "drag") {
        // Draw the drag path line
        ctx.beginPath();
        ctx.moveTo(this.dragStartX, this.dragStartY);
        ctx.lineTo(this.dragEndX, this.dragEndY);
        ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Update the circle's position to move along both x and y axes
        const currentX =
          this.dragStartX +
          this.dragProgress * (this.dragEndX - this.dragStartX);
        const currentY =
          this.dragStartY +
          this.dragProgress * (this.dragEndY - this.dragStartY);

        // Draw the circle at the current position
        ctx.beginPath();
        ctx.arc(currentX, currentY, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
        ctx.fill();
        ctx.closePath();

        // Draw outer ring (shrinking or static while moving)
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
        this.radius -= this.speed; // Shrinking speed
        if (this.radius <= this.minRadius) {
          this.radius = this.minRadius;
          this.shrinking = false;
          circles = circles.filter((circle) => circle !== this); // Remove circle when shrinking is complete
        }
      } else if (this.type === "drag") {
        if (this.isMoving) {
          // Move the drag circle along the path once clicked
          this.dragProgress += 0.001; // Control how fast the circle moves along the path
          if (this.dragProgress >= 1) {
            this.isDragCompleted = true;
            circles = circles.filter((circle) => circle !== this); // Remove after drag is complete
            isDragging = false; // Resume circle generation after drag is complete
          }
        } else if (this.shrinking) {
          // While waiting for the click, shrink the outer circle
          this.radius -= this.speed;
          if (this.radius <= this.minRadius && !this.wasClicked) {
            // Remove the circle if it's not clicked during the shrinking phase
            circles = circles.filter((circle) => circle !== this);
          }
        }
      }
    }

    startMoving() {
      this.isMoving = true;
    }

    checkDrag(x, y) {
      // Check if the player stays close to the moving drag circle
      const currentX =
        this.dragStartX + this.dragProgress * (this.dragEndX - this.dragStartX);
      const distance = Math.abs(x - currentX);
      return distance < 50; // Max distance allowed to stay on the drag path
    }

    clicked(x, y) {
      if (this.type === "normal") {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
      } else if (this.type === "drag") {
        const distance = Math.abs(x - this.dragStartX);
        return distance <= this.radius && !this.isMoving; // Can only click if not moving yet
      }
      return false;
    }

    calculateScore() {
      const remainingRadius = this.radius - this.minRadius;
      if (remainingRadius < 10) {
        return 3; // Perfect click
      } else if (remainingRadius < 25) {
        return 1; // Too fast
      }
      return 0; // Missed
    }
  }

  // Generate a new circle or drag-circle randomly
  function generateCircle() {
    // Skip generating new circles while dragging
    if (isDragging) return;

    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;

    if (Math.random() < 0.2) {
      // 20% chance to generate a drag circle
      const dragEndX = Math.random() * (canvas.width - 100) + 50;
      const newDragCircle = new Circle(x, y, 75, "drag");
      newDragCircle.setDragPath(x, y, dragEndX);
      circles.push(newDragCircle);
    } else {
      const newCircle = new Circle(x, y, 75, "normal");
      circles.push(newCircle);
    }
  }

  // Handle click and hold events for normal and drag-type circles
  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let normalCircleClicked = false;

    circles.forEach((circle) => {
      if (circle.type === "normal" && circle.clicked(x, y)) {
        score += circle.calculateScore(); // Add score based on timing for normal circle
        scoreElement.textContent = score;
        circles = circles.filter((c) => c !== circle); // Remove clicked circle
        normalCircleClicked = true;
      } else if (circle.type === "drag" && circle.clicked(x, y)) {
        isHolding = true;
        isDragging = true; // Pause circle generation
        activeDragCircle = circle; // Store the active drag circle
        activeDragCircle.wasClicked = true; // Mark the circle as clicked
        activeDragCircle.startMoving(); // Start moving the circle after a successful click
      }
    });

    if (normalCircleClicked) {
      isHolding = false;
      activeDragCircle = null;
    }
  });

  // Handle movement for drag-type circles (check if the player stays on the circle)
  canvas.addEventListener("mousemove", (event) => {
    if (!isHolding || !activeDragCircle) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    if (!activeDragCircle.checkDrag(x)) {
      isHolding = false;
      activeDragCircle = null; // Fail the drag if too far away
      isDragging = false; // Resume circle generation if drag fails
    }
  });

  canvas.addEventListener("mouseup", () => {
    isHolding = false;
    activeDragCircle = null; // Reset active drag circle when mouse is released
    isDragging = false; // Resume circle generation when the drag is completed or interrupted
  });

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle) => {
      circle.update();
      circle.draw();
    });

    requestAnimationFrame(gameLoop);
  }

  // Start generating circles at intervals
  let circleInterval = setInterval(generateCircle, totalGameTime / 30); // Generate 30 circles in total

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
      clearInterval(circleInterval); // Stop generating circles after 60 seconds
    }
  }

  setInterval(updateLoading, 100);
  gameLoop();
});
