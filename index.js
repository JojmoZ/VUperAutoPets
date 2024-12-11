const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

let mainWindow;
console.log("Preload path:", path.join(__dirname, "preload.js"));

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      // devTools: false,
      experimentalFeatures: false,
      spellcheck: false,
      enableWebSQL: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "login", "index.html")); // Load your starting HTML
  //  globalShortcut.register("CommandOrControl+Shift+I", () => {});
  //  globalShortcut.register("CommandOrControl+Shift+C", () => {});
  //  globalShortcut.register("F12", () => {});
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' https://*; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://*",
          ],
        },
      });
    }
  );

});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
