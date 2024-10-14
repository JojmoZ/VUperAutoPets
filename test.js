const chatLog = document.getElementById("chat-log");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");

// Create a BroadcastChannel for cross-tab communication
const channel = new BroadcastChannel("chat_channel");

// Function to add a message to the chat log
function addMessageToLog(message, isSelf = false) {
  const msgElem = document.createElement("p");
  msgElem.textContent = message;
  msgElem.style.color = isSelf ? "blue" : "black";
  chatLog.appendChild(msgElem);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Send message to the BroadcastChannel
sendBtn.onclick = () => {
  const message = messageInput.value.trim();
  if (message !== "") {
    const fullMessage = `You: ${message}`;
    addMessageToLog(fullMessage, true);
    channel.postMessage(fullMessage); // Broadcast to other tabs
    messageInput.value = "";
  }
};

// Listen for messages from the BroadcastChannel
channel.onmessage = (event) => {
  addMessageToLog(event.data);
};
