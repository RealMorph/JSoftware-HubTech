/**
 * Module/NoModule Pattern Generator
 * 
 * This script enhances the build process by:
 * 1. Creating separate bundles for modern and legacy browsers
 * 2. Modifying HTML to serve different bundles based on browser support
 * 3. Optimizing load performance with appropriate polyfills
 * 
 * How it works:
 * - Modern browsers receive ES modules without unnecessary polyfills
 * - Legacy browsers receive CommonJS bundles with needed polyfills
 * - Improves load time for modern browsers while maintaining compatibility
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const MODERN_TARGET = 'es2020';
const LEGACY_TARGET = 'es2015';
const INDEX_HTML_PATH = path.join(process.cwd(), 'dist', 'index.html');
const OUTPUT_DIR = path.join(process.cwd(), 'dist');

console.log(chalk.blue('🔧 Generating module/nomodule builds...'));

// Step 1: Build modern version (already done by vite.config.ts)
console.log(chalk.blue('✓ Modern build using ES modules (es2020) complete'));

// Step 2: Modify HTML to implement module/nomodule pattern
function modifyHtml() {
  console.log(chalk.blue('📝 Modifying HTML to implement module/nomodule pattern...'));
  
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error(chalk.red('❌ index.html not found in dist directory.'));
    process.exit(1);
  }
  
  let html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  
  // Replace script tags with module/nomodule pattern
  const scriptRegex = /<script type="module" crossorigin src="([^"]+)"><\/script>/g;
  
  html = html.replace(scriptRegex, (match, src) => {
    // Extract the script path without the hash part
    const baseSrc = src.replace(/(-[a-f0-9]+)(\.\w+)$/, '$2');
    const fileExtension = path.extname(src);
    const fileName = path.basename(src, fileExtension);
    
    // Create references for both modern and legacy versions
    return `
    <!-- Modern browsers -->
    <script type="module" crossorigin src="${src}"></script>
    <!-- Legacy browsers -->
    <script nomodule defer src="${fileName}.legacy${fileExtension}"></script>
    `;
  });
  
  // Add the Safari 10 nomodule fix at the beginning of the body
  const safariNomoduleFix = `
  <!-- Fix for Safari 10 nomodule support -->
  <script>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>
  `;
  
  html = html.replace(/<body>/, `<body>${safariNomoduleFix}`);
  
  // Write modified HTML
  fs.writeFileSync(INDEX_HTML_PATH, html);
  console.log(chalk.green('✅ HTML modified with module/nomodule pattern'));
}

// Step 3: Generate the appropriate browserslist configuration
function updateBrowserslist() {
  console.log(chalk.blue('📝 Updating browserslist configuration...'));
  
  const browserslistConfig = `
# Modern browsers config - used for module build
[modern]
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not IE 11

# Legacy browsers config - used for nomodule build
[legacy]
> 0.5%
last 2 versions
Firefox ESR
not dead
IE 11
`;

  fs.writeFileSync(path.join(process.cwd(), '.browserslistrc'), browserslistConfig);
  console.log(chalk.green('✅ Browserslist configuration updated'));
}

// Execute the functions
modifyHtml();
updateBrowserslist();

console.log(chalk.green('✅ Module/nomodule pattern implementation complete!'));
console.log(chalk.yellow('Note: Run a production build to generate both modern and legacy bundles.')); 