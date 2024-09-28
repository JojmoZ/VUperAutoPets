const canvas = document.getElementById('battleCanvas');
const ctx = canvas.getContext('2d');
const terminal = document.getElementById('terminal');

let coins = 10;
let shopAnimals = [
  { name: 'Ant', attack: 2, health: 1, cost: 2, star: 1, ability: 'Faint: Give +2/+1 to a random ally', img: '../assets/Ant.webp' },
  { name: 'Fish', attack: 2, health: 3, cost: 5, star: 2, ability: 'Level-Up: Give all friends +1/+1', img: '../assets/Fish.webp' },
  { name: 'Lion', attack: 3, health: 4, cost: 7, star: 3, ability: 'Start of battle: Gain +3/+3 if you are the highest tier', img: '../assets/Lion.webp' }
];

let team = [null, null, null];
let enemyTeam = [];
let selectedTeamSlot = null;

function updateCoinsDisplay() {
  document.getElementById('coins').textContent = `Coins: ${coins}`;
}

// Function to handle buying an animal from the shop
function buyAnimal(shopIndex) {
  const animal = shopAnimals[shopIndex];
  // Find the first available slot
  const availableSlotIndex = team.findIndex(slot => slot === null);

  if (availableSlotIndex !== -1 && coins >= animal.cost) {
    team[availableSlotIndex] = { ...animal };
    coins -= animal.cost;
    updateCoinsDisplay();
    render();
  } else if (availableSlotIndex === -1) {
    alert('Your team is full!');
  }
}


// Function to handle selecting a team slot
function selectTeamSlot(slotIndex) {
  selectedTeamSlot = slotIndex;
}
function generateEnemyTeam() {
  let enemyCoins = 10;
  enemyTeam = [null, null, null]; 
  
  while (enemyCoins > 0 && enemyTeam.filter(a => a).length < 3) {
    const randomAnimal = shopAnimals[Math.floor(Math.random() * shopAnimals.length)];
    if (enemyCoins >= randomAnimal.cost) {
      for (let i = 0; i < enemyTeam.length; i++) {
        if (!enemyTeam[i]) {
          enemyTeam[i] = { ...randomAnimal };
          enemyCoins -= randomAnimal.cost;
          break;
        }
      }
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render player's team on the left
  team.forEach((animal, index) => {
    if (animal) {
      let img = new Image();
      img.src = animal.img;
      img.onload = () => {
        ctx.drawImage(img, index * 100 + 20, 20, 60, 60);
      };
      ctx.fillStyle = 'black';
      ctx.fillText(`A:${animal.attack}/H:${animal.health}`, index * 100 + 20, 100);
    }
  });

  // Render enemy's team on the right
  enemyTeam.forEach((animal, index) => {
    if (animal) {
      let img = new Image();
      img.src = animal.img;
      img.onload = () => {
        ctx.drawImage(img, canvas.width - (index * 100 + 80), 20, 60, 60);
      };
      ctx.fillStyle = 'red';
      ctx.fillText(`A:${animal.attack}/H:${animal.health}`, canvas.width - (index * 100 + 80), 100);
    }
  });
}

// Function to log messages to the terminal
function logToTerminal(message) {
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  terminal.appendChild(paragraph);
  terminal.scrollTop = terminal.scrollHeight; // Scroll to bottom
}

function startBattle() {
  if (team.some(animal => animal)) {
    generateEnemyTeam();
    render();  // Ensure rendering occurs before battle simulation
    setTimeout(simulateBattle, 100);  // Delay battle to ensure rendering completes
  } else {
    alert('Please select at least one animal for your team!');
  }
}


function simulateBattle() {
    terminal.innerHTML = ''; // Clear terminal for new battle log
    let turnCount = 1;
    const maxTurns = 10;

    function playTurn() {
        if (turnCount > maxTurns || !team.some(animal => animal) || !enemyTeam.some(animal => animal)) {
            // Determine the winner after the loop ends
            const playerSurvivors = team.filter(animal => animal !== null).length;
            const enemySurvivors = enemyTeam.filter(animal => animal !== null).length;

            if (playerSurvivors > enemySurvivors) {
                logToTerminal('User wins!');
            } else if (playerSurvivors < enemySurvivors) {
                logToTerminal('Enemy wins!');
            } else {
                logToTerminal('It\'s a draw!');
            }

            render(); // Final render to show the final state
            return;
        }

        logToTerminal(`Turn ${turnCount}`);

        // Start with the first alive animal in the player's team
        const playerAnimalIndex = team.findIndex(animal => animal !== null);
        const playerAnimal = team[playerAnimalIndex];

        if (playerAnimal) {
            // Find the first alive animal in the enemy's team
            const enemyAnimalIndex = enemyTeam.findIndex(animal => animal !== null);
            const enemyAnimal = enemyTeam[enemyAnimalIndex];

            if (enemyAnimal) {
                logToTerminal(`User's ${playerAnimal.name} attacks`);
                logToTerminal(`Enemy's ${enemyAnimal.name} attacks`);

                // Simultaneous attack
                enemyAnimal.health -= playerAnimal.attack;
                playerAnimal.health -= enemyAnimal.attack;

                // Check if both animals die in the same turn
                if (enemyAnimal.health <= 0 && playerAnimal.health <= 0) {
                    logToTerminal(`Enemy's ${enemyAnimal.name} died`);
                    logToTerminal(`User's ${playerAnimal.name} died`);
                    enemyTeam[enemyAnimalIndex] = null; // Remove the defeated enemy
                    team[playerAnimalIndex] = null; // Remove the defeated player's animal
                    render();  // Update canvas

                    // If both teams have no animals left, it's a draw
                    if (!team.some(animal => animal) && !enemyTeam.some(animal => animal)) {
                        logToTerminal("It's a draw!");
                        return; // Exit the function after showing the result
                    }
                } else {
                    // Check if the enemy animal dies
                    if (enemyAnimal.health <= 0) {
                        logToTerminal(`Enemy's ${enemyAnimal.name} died`);
                        enemyTeam[enemyAnimalIndex] = null; // Remove the defeated enemy
                        render();  // Update canvas after enemy animal dies
                    }

                    // Check if the player's animal dies
                    if (playerAnimal.health <= 0) {
                        logToTerminal(`User's ${playerAnimal.name} died`);
                        team[playerAnimalIndex] = null; // Remove the defeated player's animal
                        render();  // Update canvas after player animal dies
                    }
                }
            }
        }

        // Check if all player's animals are dead
        if (!team.some(animal => animal)) {
            if (!enemyTeam.some(animal => animal)) {
                logToTerminal("It's a draw!");
            } else {
                logToTerminal("You lose!");
            }
            return; // Exit the loop after showing the result
        }

        // Check if all enemy's animals are dead
        if (!enemyTeam.some(animal => animal)) {
            logToTerminal("You win!");
            return; // Exit the loop after showing the result
        }

        turnCount++;
        setTimeout(playTurn, 1000);
    }

    playTurn(); 
}

updateCoinsDisplay();
render();

