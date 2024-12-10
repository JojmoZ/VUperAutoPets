const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const baseDir = __dirname;

// Function to minify a CSS file
const minifyCssFile = (filePath) => {
  const outputPath = filePath.replace(/\.css$/, ".min.css");
  execSync(`npx csso-cli "${filePath}" --output "${outputPath}"`);
  console.log(`Minified: ${filePath}`);
};

// Function to recursively process CSS files
const minifyDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (
      fs.statSync(fullPath).isDirectory() &&
      file !== "node_modules" &&
      file !== "dist"
    ) {
      minifyDirectory(fullPath); // Recursively process subdirectories
    } else if (file.endsWith(".css")) {
      minifyCssFile(fullPath);
    }
  }
};

// Start minification
minifyDirectory(baseDir);
console.log("CSS Minification complete.");
uild