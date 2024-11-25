const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });
let players = []; 
let readyCount = 0; 

server.on("connection", (socket) => {
  players.push(socket);

  
  if (players.length === 2) {
    players[0].send(JSON.stringify({ message: "paired" }));
    players[1].send(JSON.stringify({ message: "paired" }));
  }

  socket.on("message", (data) => {
    const parsed = JSON.parse(data);

    if (parsed.type === "data") {
      
      const opponent = players.find((player) => player !== socket);
      if (opponent) {
        opponent.send(
          JSON.stringify({
            battleLineup: parsed.battleLineup,
            teamName: parsed.teamName,
          })
        );
      }
    } else if (parsed.type === "ready") {
      
      readyCount++;
      console.log("Player ready. Total ready:", readyCount);

      
      if (readyCount === 2) {
        players.forEach((player) => {
          player.send(JSON.stringify({ type: "start" }));
        });
        readyCount = 0; 
      }
    }
  });

  socket.on("close", () => {
    players = players.filter((player) => player !== socket);
    readyCount = 0; 
  });
});

console.log("WebSocket server running on ws://localhost:8080");
