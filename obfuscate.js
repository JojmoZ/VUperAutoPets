const path = require("path");
const fs = require("fs");
const javascriptObfuscator = require("javascript-obfuscator");

const baseDir = __dirname; // Use the current directory of your project

// Function to obfuscate a single JS file
const obfuscateFile = (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");
  const obfuscatedCode = javascriptObfuscator
    .obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      selfDefending: true,
      deadCodeInjection: true,
    })
    .getObfuscatedCode();
  fs.writeFileSync(filePath, obfuscatedCode, "utf8");
};

// Function to recursively obfuscate JS files in directories
const obfuscateDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (
      fs.statSync(fullPath).isDirectory() &&
      file !== "node_modules" &&
      file !== "dist"
    ) {
      obfuscateDirectory(fullPath); // Recursively process subdirectories
    } else if (
      file.endsWith(".js") &&
      ![
        "obfuscate.js",
        "index.js",
        "jquery-3.6.0.min.js",
        "modal.js",
        "preload.js",
        "minify-all.js",
        "minify-css.js",
        "minify-html.js",
      ].includes(file)
    ) {
      console.log(`Obfuscating: ${fullPath}`);
      obfuscateFile(fullPath);
    }
  }
};

// Start obfuscation from the project root
obfuscateDirectory(baseDir);
console.log("Obfuscation complete.");
