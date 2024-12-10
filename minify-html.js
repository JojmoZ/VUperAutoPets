const path = require("path");
const fs = require("fs");
const htmlMinifier = require("html-minifier-terser");

const baseDir = __dirname;

// Function to minify an HTML file
const minifyHtmlFile = async (filePath) => {
  const html = fs.readFileSync(filePath, "utf8");
  const minifiedHtml = await htmlMinifier.minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true, // Minify inline CSS
    minifyJS: true, // Minify inline JS
    keepClosingSlash: true, // Keep closing slash for self-closing tags
    removeAttributeQuotes: false, // Don't remove quotes around attributes
    sortAttributes: true, // Sort attributes for consistency
    sortClassName: true, // Sort class names for consistency
  });
  fs.writeFileSync(filePath, minifiedHtml, "utf8");
  console.log(`Minified: ${filePath}`);
};

// Function to recursively process HTML files
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
    } else if (file.endsWith(".html")) {
      minifyHtmlFile(fullPath);
    }
  }
};

// Start minification
minifyDirectory(baseDir);
console.log("HTML Minification complete.");
