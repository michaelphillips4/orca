const sass = require("sass");
const fs = require("fs");
const path = require("path");

// Source and destination directories
const srcDir = "src"; // Where your .scss files are
const destDir = "public"; // Where the compiled .css files will be saved

// Ensure the output directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to compile Sass using modern Dart Sass API
const compileSass = async (filePath) => {
  try {
    // Using the new async compile method
    const result = await sass.compile(filePath, {
      style: "compressed", // Minify the output CSS
    });
    return result.css;
  } catch (error) {
    throw new Error(`Error compiling Sass: ${error.message}`);
  }
};

// Read and compile each .scss file in the source directory
fs.readdirSync(srcDir).forEach(async (file) => {
  if (file.endsWith(".scss")) {
    const scssFilePath = path.join(srcDir, file);
    try {
      // Compile the .scss file asynchronously
      const cssOutput = await compileSass(scssFilePath);

      // Generate the output file name and path for the .min.css file
      const outputFilePath = path.join(
        destDir,
        file.replace(".scss", ".min.css")
      );

      // Write the compiled CSS to the destination directory
      fs.writeFileSync(outputFilePath, cssOutput);
      console.log(`Compiled: ${file} -> ${path.basename(outputFilePath)}`);
    } catch (error) {
      console.error(`Error compiling ${file}:`, error);
    }
  }
});
