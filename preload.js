const { contextBridge } = require("electron");
const path = require("path");

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
  path: path,
  __dirname: __dirname, // Expose __dirname
});

console.log("Preload script loaded successfully");
