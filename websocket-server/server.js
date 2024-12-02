const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid"); 

const server = new WebSocket.Server({ port: 8080 });
const playerQueue = []; 
const gameRooms = []; 

server.on("connection", (socket) => {
  console.log("New connection established");
  socket.id = uuidv4();

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "joinQueue") {
      console.log(`Player joined the queue: ${socket.id}`);
      handlePlayerJoin(socket);
    }

    if (data.type === "sendData") {
      const room = findRoomByPlayer(socket);
      if (room) {
        console.log(`Received player data from: ${socket.id}`);
        handlePlayerData(socket, room, data);
      } else {
        console.warn(`Room not found for player: ${socket.id}`);
      }
    }
  });

  socket.on("close", () => {
    console.log(`Player disconnected: ${socket.id}`);
    removePlayerFromQueue(socket);
    removePlayerFromRoom(socket);
  });
});

function handlePlayerJoin(socket) {
  if (playerQueue.length > 0) {
    const opponent = playerQueue.shift();
    console.log(`Creating room for players: ${opponent.id}, ${socket.id}`);
    createGameRoom(opponent, socket);
  } else {
    playerQueue.push(socket);
    socket.send(JSON.stringify({ type: "waiting" }));
  }
}

function createGameRoom(player1, player2) {
  const room = {
    players: [player1, player2],
    data: {}, 
  };

  gameRooms.push(room);

  console.log(`Game room created: ${player1.id} vs ${player2.id}`);

  room.players.forEach((player, index) => {
    player.send(JSON.stringify({ type: "paired", playerNumber: index + 1 }));
  });
}

function handlePlayerData(socket, room, data) {
  room.data[socket.id] = {
    battleLineup: data.battleLineup,
    teamName: data.teamName,
    username: data.username,
    lives: data.lives,
  };

  console.log(`Data stored for player: ${socket.id}`, room.data);

  
  if (Object.keys(room.data).length === 2) {
    room.players.forEach((player) => {
      const opponent = room.players.find((p) => p !== player);
      const opponentData = room.data[opponent.id];
      player.send(JSON.stringify({ type: "opponentData", ...opponentData }));
    });

    
    room.players.forEach((player) =>
      player.send(JSON.stringify({ type: "start" }))
    );
  }
}

function findRoomByPlayer(player) {
  return gameRooms.find((room) => room.players.includes(player));
}

function removePlayerFromQueue(socket) {
  const index = playerQueue.findIndex((player) => player.id === socket.id);
  if (index !== -1) {
    playerQueue.splice(index, 1);
    console.log(`Player removed from queue: ${socket.id}`);
  }
}

function removePlayerFromRoom(socket) {
  const roomIndex = gameRooms.findIndex((room) =>
    room.players.includes(socket)
  );

  if (roomIndex !== -1) {
    const room = gameRooms[roomIndex];
    const opponent = room.players.find((player) => player !== socket);

    if (opponent) {
      opponent.send(JSON.stringify({ type: "opponentDisconnected" }));
      handlePlayerJoin(opponent); 
    }

    gameRooms.splice(roomIndex, 1);
    console.log(`Player removed from room: ${socket.id}`);
  }
}

console.log("WebSocket server running on ws://localhost:8080");
