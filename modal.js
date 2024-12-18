class Modal {
  constructor() {
    this.createModal();
  }

  createModal() {
    this.modalOverlay = document.createElement("div");
    this.modalBox = document.createElement("div");
    this.modalContent = document.createElement("div");
    this.modalCloseButton = document.createElement("button");
    this.closeIcon = document.createElement("span");
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
      z-index: 10012312678330;
    `;
    this.modalBox.style.cssText = `
      background:white;
      border: 0.5rem solid black;
      padding: 2rem 2rem 1.5rem 2rem;
      border-radius: 0.5rem;
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
      color: black;
      line-height: 1.5;
    `;
    this.modalCloseButton.style.cssText = `
      padding: 15px 30px;
      background-image: url("../assets/buttons/close-btn.png");
      background-size: cover;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
      width: 13vw;
      height: 4.5rem;
    `;
    this.modalCloseButton.textContent = "";
    this.modalCloseButton.addEventListener("mouseenter", () => {
      this.modalCloseButton.style.transform = "scale(1.1)";
      this.modalCloseButton.style.color = "white";

      this.closeIcon.style.opacity = "1";
    });
    this.modalCloseButton.addEventListener("mouseleave", () => {
      this.modalCloseButton.style.transform = "scale(1)";
      this.modalCloseButton.style.color = "white";

      this.closeIcon.style.opacity = "0";
    });
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
    this.modalCloseButton.appendChild(this.closeIcon);
    this.modalBox.appendChild(this.modalContent);
    this.modalBox.appendChild(this.modalCloseButton);
    this.modalOverlay.appendChild(this.modalBox);
    document.body.appendChild(this.modalOverlay);
    this.modalCloseButton.addEventListener("click", () => this.hideModal());
  }
  showModal(message) {
    this.modalContent.textContent = message;
    this.modalOverlay.style.display = "flex";
    setTimeout(() => {
      this.modalBox.style.transform = "scale(1)";
      this.modalBox.style.opacity = "1";
    }, 10);
  }
  hideModal() {
    this.modalBox.style.transform = "scale(0.8)";
    this.modalBox.style.opacity = "0";
    setTimeout(() => {
      this.modalOverlay.style.display = "none";
    }, 300);
  }
}
const modal = new Modal();
window.ShowModal = (message) => modal.showModal(message);
