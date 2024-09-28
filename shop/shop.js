document.addEventListener("DOMContentLoaded", function() {
    // Check if user data exists in local storage, if not, set default values
    if (!localStorage.getItem('coins')) {
        localStorage.setItem('coins', '15');
        localStorage.setItem('ownedAnimals', JSON.stringify([]));
    }

    const cards = document.querySelectorAll(".card");
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-animal-image");
    const confirmButton = document.getElementById("confirm-buy");
    const cancelButton = document.getElementById("cancel-buy");
    const coinsDisplay = document.createElement('div');

    coinsDisplay.id = 'coinsDisplay';
    coinsDisplay.style.position = 'absolute';
    coinsDisplay.style.top = '20px';
    coinsDisplay.style.right = '20px';
    coinsDisplay.style.color = 'white';
    coinsDisplay.style.fontSize = '20px';
    document.body.appendChild(coinsDisplay);

    function updateCoinsDisplay() {
        const coins = localStorage.getItem('coins');
        coinsDisplay.textContent = `Coins: ${coins}`;
    }

    updateCoinsDisplay();

    cards.forEach(card => {
        card.addEventListener("click", function() {
            const animalName = this.querySelector("h3").textContent;
            const animalImage = this.querySelector("img").src;

            // Check if user already owns this animal
            let ownedAnimals = JSON.parse(localStorage.getItem('ownedAnimals'));
            if (ownedAnimals.includes(animalName)) {
                alert("You already own this animal!");
                return;
            }

            modalImage.src = animalImage;
            modal.setAttribute('data-animal', animalName);
            modal.setAttribute('data-price', this.querySelector('p').textContent.match(/\d+/)[0]);
            modal.classList.add("show");
            modal.style.display = "flex";
        });
    });

    cancelButton.addEventListener("click", function() {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
        }, 500);
    });

    confirmButton.addEventListener("click", function() {
        const animalName = modal.getAttribute('data-animal');
        const price = parseInt(modal.getAttribute('data-price'), 10);

        let coins = parseInt(localStorage.getItem('coins'), 10);
        let ownedAnimals = JSON.parse(localStorage.getItem('ownedAnimals'));

        if (coins >= price) {
            coins -= price;
            ownedAnimals.push(animalName);

            localStorage.setItem('coins', coins.toString());
            localStorage.setItem('ownedAnimals', JSON.stringify(ownedAnimals));

            updateCoinsDisplay();
            alert(`You have successfully purchased the ${animalName}!`);
        } else {
            alert("You don't have enough coins to buy this animal!");
        }

        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
        }, 500);
    });
});
