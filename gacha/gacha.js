document.addEventListener("DOMContentLoaded", function () {
    const lever = document.getElementById("lever");
    const gachaResult = document.getElementById("gachaResult");
    const slot1 = document.getElementById("slot1");
    const slot2 = document.getElementById("slot2");
    const slot3 = document.getElementById("slot3");

    let shopAnimals = [];

    fetch("../assets/shopAnimals.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            shopAnimals = data;
            console.log("shopAnimals loaded:", shopAnimals);
        })
        .catch((error) => console.error("Error loading shopAnimals:", error));

    let isDragging = false;
    let startY;

    lever.addEventListener("mousedown", function (e) {
        isDragging = true;
        startY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
        if (isDragging) {
            const offsetY = e.clientY - startY;
            if (offsetY > 0 && offsetY <= 100) {
                lever.style.transform = `translateY(${offsetY}px)`;
            }
            if (offsetY > 100) {
                isDragging = false;
                lever.style.transform = `translateY(100px)`;
                setTimeout(() => {
                    pullHandle();
                }, 500);
            }
        }
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        lever.style.transform = `translateY(0)`;
    });

    function pullHandle() {
        const coins = parseInt(localStorage.getItem("coins"), 10);
        if (coins < 5) {
            alert("You need at least 5 coins to play the Gacha!");
            lever.style.transform = `translateY(0)`;
            return;
        }

        const selectedAnimal1 = getRandomAnimal();
        const selectedAnimal2 = getRandomAnimal();
        const selectedAnimal3 = getRandomAnimal();

        animateSlot(slot1, selectedAnimal1, () => {
            animateSlot(slot2, selectedAnimal2, () => {
                animateSlot(slot3, selectedAnimal3, () => {
                    if (selectedAnimal1.name === selectedAnimal2.name && selectedAnimal2.name === selectedAnimal3.name) {
                        alert("Congratulations! You win something!");
                    }
                    localStorage.setItem("coins", (coins - 5).toString());
                    lever.style.transform = `translateY(0)`;
                });
            });
        });
    }

    function getRandomAnimal() {
        const random = Math.random();
        if (random < 0.05) {
            const specialRewards = shopAnimals.filter(animal => 
                ["MSeer", "VJanda", "YenguiK", "PamstIr"].includes(animal.name)
            );
            return specialRewards[Math.floor(Math.random() * specialRewards.length)];
        } else {
            return shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
        }
    }

    function animateSlot(slot, selectedAnimal, callback) {
        let index = 0;
        const interval = setInterval(() => {
            slot.innerHTML = `<img src="${shopAnimals[index].img}" alt="${shopAnimals[index].name}">`;
            index = (index + 1) % shopAnimals.length;
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            slot.innerHTML = `<img src="${selectedAnimal.img}" alt="${selectedAnimal.name}">`;
            callback();
        }, 2000 + Math.random() * 2000);
    }
});