const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const baseDir = __dirname;

// Function to minify a CSS file and replace the original
const minifyCssFile = (filePath) => {
  const tempOutputPath = filePath + ".tmp"; // Temporary output file
  execSync(
    `npx csso-cli "${filePath}" --restructure-off --output "${tempOutputPath}"`
  );
  fs.renameSync(tempOutputPath, filePath); // Replace the original file
  console.log(`Minified and replaced: ${filePath}`);
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
