class Modal {
  constructor() {
    this.createModal();
  }

  // Create modal dynamically
  createModal() {
    // Create modal elements
    this.modalOverlay = document.createElement("div");
    this.modalBox = document.createElement("div");
    this.modalContent = document.createElement("div");
    this.modalCloseButton = document.createElement("button");
    this.closeIcon = document.createElement("span"); // Icon placeholder

    // Add styles
    this.modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    this.modalBox.style.cssText = `
      background: linear-gradient(135deg, rgba(0, 0, 255, 0.8), rgba(255, 0, 0, 0.8));
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 80%;
      min-width: 400px;
      transform: scale(0.8);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    `;

    this.modalContent.style.cssText = `
      margin-bottom: 20px;
      font-size: 2.5rem;
      color: white;
      line-height: 1.5;
    `;

    this.modalCloseButton.style.cssText = `
      padding: 15px 30px;
      font-size: 1.2rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
    `;

    this.modalCloseButton.textContent = "Close";

    // Close button hover effect
    this.modalCloseButton.addEventListener("mouseenter", () => {
      this.modalCloseButton.style.transform = "scale(1.1)";
      this.modalCloseButton.style.backgroundColor = "#ff4757"; // Change to red on hover
      this.modalCloseButton.style.color = "white";

      this.closeIcon.style.opacity = "1"; // Show icon
    });

    this.modalCloseButton.addEventListener("mouseleave", () => {
      this.modalCloseButton.style.transform = "scale(1)";
      this.modalCloseButton.style.backgroundColor = "#007bff";
      this.modalCloseButton.style.color = "white";

      this.closeIcon.style.opacity = "0"; // Hide icon
    });

    // Icon styling
    this.closeIcon.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;

    // Append icon to button
    this.modalCloseButton.appendChild(this.closeIcon);

    // Append elements
    this.modalBox.appendChild(this.modalContent);
    this.modalBox.appendChild(this.modalCloseButton);
    this.modalOverlay.appendChild(this.modalBox);
    document.body.appendChild(this.modalOverlay);

    // Add event listener to close button
    this.modalCloseButton.addEventListener("click", () => this.hideModal());
  }

  // Show modal with animation
  showModal(message) {
    this.modalContent.textContent = message;
    this.modalOverlay.style.display = "flex";

    // Trigger animation
    setTimeout(() => {
      this.modalBox.style.transform = "scale(1)";
      this.modalBox.style.opacity = "1";
    }, 10); // Slight delay to allow animation to kick in
  }

  // Hide modal with animation
  hideModal() {
    // Start the animation out
    this.modalBox.style.transform = "scale(0.8)";
    this.modalBox.style.opacity = "0";

    // Remove modal from view after animation
    setTimeout(() => {
      this.modalOverlay.style.display = "none";
    }, 300); // Match the duration of the CSS transition
  }
}

// Instantiate the modal
const modal = new Modal();

// Expose the function for showing the modal
window.ShowModal = (message) => modal.showModal(message);
