// Prebuild script to minify and copy assets
const fs = require('fs');
const path = require('path');

console.log("🔨 Starting build process...");

// Directories
const srcDir = './src';
const distDir = './dist';

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Function to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(` Copied: ${srcPath} -> ${destPath}`);
        }
    }
}

// Function to minify CSS (simple version)
function minifyCSS(css) {
    return css
        .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '')
        .replace(/\s+/g, ' ')
        .replace(/;}/g, '}')
        .trim();
}

// Function to minify JS (simple version)
function minifyJS(js) {
    return js
        .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Copy and minify CSS files
function processCSS() {
    const cssDir = path.join(srcDir, 'assets', 'css');
    const distCssDir = path.join(distDir, 'assets', 'css');
    
    if (!fs.existsSync(distCssDir)) {
        fs.mkdirSync(distCssDir, { recursive: true });
    }
    
    const cssFiles = fs.readdirSync(cssDir);
    
    for (let file of cssFiles) {
        if (path.extname(file) === '.css') {
            const srcPath = path.join(cssDir, file);
            const destPath = path.join(distCssDir, file);
            
            const cssContent = fs.readFileSync(srcPath, 'utf8');
            const minifiedCSS = minifyCSS(cssContent);
            
            fs.writeFileSync(destPath, minifiedCSS);
            console.log(` Minified CSS: ${file}`);
        }
    }
}

// Copy and minify JS files
function processJS() {
    const classesDir = path.join(srcDir, 'classes');
    const distClassesDir = path.join(distDir, 'classes');
    
    if (!fs.existsSync(distClassesDir)) {
        fs.mkdirSync(distClassesDir, { recursive: true });
    }
    
    const jsFiles = fs.readdirSync(classesDir);
    
    for (let file of jsFiles) {
        if (path.extname(file) === '.js') {
            const srcPath = path.join(classesDir, file);
            const destPath = path.join(distClassesDir, file);
            
            const jsContent = fs.readFileSync(srcPath, 'utf8');
            const minifiedJS = minifyJS(jsContent);
            
            fs.writeFileSync(destPath, minifiedJS);
            console.log(` Minified JS: ${file}`);
        }
    }
    
    // Process renderer.js
    const rendererSrc = path.join(srcDir, '_renderer.js');
    const rendererDest = path.join(distDir, '_renderer.js');
    
    if (fs.existsSync(rendererSrc)) {
        const jsContent = fs.readFileSync(rendererSrc, 'utf8');
        const minifiedJS = minifyJS(jsContent);
        fs.writeFileSync(rendererDest, minifiedJS);
        console.log(` Minified JS: _renderer.js`);
    }
}

// Copy HTML file
function processHTML() {
    const srcHTML = path.join(srcDir, 'ui.html');
    const destHTML = path.join(distDir, 'ui.html');
    
    if (fs.existsSync(srcHTML)) {
        fs.copyFileSync(srcHTML, destHTML);
        console.log(` Copied HTML: ui.html`);
    }
}

// Copy assets (fonts, themes, misc)
function processAssets() {
    const assetDirs = ['fonts', 'themes', 'misc'];
    
    for (let dir of assetDirs) {
        const srcAssetDir = path.join(srcDir, 'assets', dir);
        const distAssetDir = path.join(distDir, 'assets', dir);
        
        if (fs.existsSync(srcAssetDir)) {
            copyDir(srcAssetDir, distAssetDir);
        }
    }
}

// Main build process
try {
    console.log("📂 Copying directory structure...");
    copyDir(srcDir, distDir);
    
    console.log("📄 Processing CSS files...");
    processCSS();
    
    console.log("📜 Processing JS files...");
    processJS();
    
    console.log("🌐 Processing HTML files...");
    processHTML();
    
    console.log("📁 Processing assets...");
    processAssets();
    
    console.log("✅ Build process completed successfully!");
} catch (error) {
    console.error("❌ Build process failed:", error);
    process.exit(1);
}