const fs = require("fs");
const path = require("path");
const terser = require("terser");

// Function to recursively get all JavaScript files, excluding specific files and node_modules
const getAllJSFiles = (dir) => {
  let results = [];
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      // Skip node_modules directory
      if (file === "node_modules") {
        return;
      }
      results = results.concat(getAllJSFiles(fullPath)); // Recurse into other directories
    } else if (
      file.endsWith(".js") && // Only process .js files
      !file.endsWith("-minify.js") && // Skip already minified files
      file !== "minify-all.js" && // Skip this script itself
      file !== "index.js" && // Skip index.js
      file !== "preload.js" &&// Skip preload.js
      file !== "jquery-3.6.0.min.js" && // Skip jquery-3.6.0.min.js
      file !== "modal.js"
    ) {
      results.push(fullPath);
    }
  });
  return results;
};

// Function to minify a file and save it
const minifyFile = async (filePath) => {
  try {
    const code = fs.readFileSync(filePath, "utf8");
    const minified = await terser.minify(code, {
      compress: true,
      mangle: true,
    });

    if (minified.error) {
      console.error(`Error minifying ${filePath}:`, minified.error);
      return;
    }

    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ".js");
    const outputFilePath = path.join(dir, `${baseName}-minify.js`);

    fs.writeFileSync(outputFilePath, minified.code, "utf8");
    console.log(`Minified: ${filePath} -> ${outputFilePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function to process all files
const main = async () => {
  const startDir = process.cwd(); // Start in the current working directory
  const allJSFiles = getAllJSFiles(startDir);

  console.log(`Found ${allJSFiles.length} JS files.`);
  for (const file of allJSFiles) {
    await minifyFile(file);
  }
};

main().catch((error) => console.error("Error in script:", error));
