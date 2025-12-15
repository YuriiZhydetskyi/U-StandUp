const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.join(__dirname, '..', 'src', 'img');
const SOURCE_FILE = path.join(IMG_DIR, 'favicon 1129x1129.png');

// Favicon sizes recommended by Google and for various platforms
const FAVICON_SIZES = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },      // Google minimum recommended
    { size: 96, name: 'favicon-96x96.png' },
    { size: 144, name: 'favicon-144x144.png' },
    { size: 192, name: 'favicon-192x192.png' },   // Android Chrome
    { size: 512, name: 'favicon-512x512.png' },   // PWA
    { size: 180, name: 'apple-touch-icon.png' },  // Apple devices
];

async function generateFavicons() {
    console.log('\n🎨 Favicon Generation Script\n');
    console.log('━'.repeat(50));

    // Check if source file exists
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`❌ Source file not found: ${SOURCE_FILE}`);
        process.exit(1);
    }

    const sourceStats = fs.statSync(SOURCE_FILE);
    console.log(`📁 Source: fovicon 1477x1477.png (${(sourceStats.size / 1024).toFixed(1)} KB)`);
    console.log(`📂 Output: ${IMG_DIR}\n`);
    console.log('━'.repeat(50));
    console.log('Generating favicons...\n');

    let skipped = 0;
    let generated = 0;

    for (const { size, name } of FAVICON_SIZES) {
        const outputPath = path.join(IMG_DIR, name);

        // Skip if output exists and is newer than source
        if (fs.existsSync(outputPath)) {
            const outputStats = fs.statSync(outputPath);
            if (outputStats.mtime >= sourceStats.mtime) {
                console.log(`  ⏭️  ${name} is up to date, skipping`);
                skipped++;
                continue;
            }
        }

        try {
            await sharp(SOURCE_FILE)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center'
                })
                .png({ quality: 100 })
                .toFile(outputPath);

            const outputStats = fs.statSync(outputPath);
            console.log(`  ✅ ${name} (${size}x${size}) - ${(outputStats.size / 1024).toFixed(1)} KB`);
            generated++;
        } catch (error) {
            console.error(`  ❌ Error creating ${name}: ${error.message}`);
        }
    }

    // Generate ICO file (multi-size for Windows)
    console.log('\n━'.repeat(50));
    console.log('Generating ICO file...\n');

    const icoPath = path.join(IMG_DIR, 'favicon.ico');
    let icoGenerated = false;

    // Skip if ICO exists and is newer than source
    if (fs.existsSync(icoPath)) {
        const icoStats = fs.statSync(icoPath);
        if (icoStats.mtime >= sourceStats.mtime) {
            console.log(`  ⏭️  favicon.ico is up to date, skipping`);
            skipped++;
        } else {
            icoGenerated = true;
        }
    } else {
        icoGenerated = true;
    }

    if (icoGenerated) {
        try {
            // ICO typically contains 16, 32, 48 sizes
            // We'll create a 48x48 version as favicon.ico (browsers will scale)
            await sharp(SOURCE_FILE)
                .resize(48, 48, {
                    fit: 'cover',
                    position: 'center'
                })
                .png()
                .toFile(icoPath);

            const icoStats = fs.statSync(icoPath);
            console.log(`  ✅ favicon.ico (48x48) - ${(icoStats.size / 1024).toFixed(1)} KB`);
            console.log('  ℹ️  Note: This is a PNG renamed to .ico (works in modern browsers)');
            generated++;
        } catch (error) {
            console.error(`  ❌ Error creating favicon.ico: ${error.message}`);
        }
    }

    console.log('\n━'.repeat(50));
    console.log('📊 Summary:\n');
    console.log(`  • Generated: ${generated} file(s)`);
    console.log(`  • Skipped (up to date): ${skipped} file(s)`);
    console.log('\n💡 Recommended HTML for <head>:\n');
    console.log(`  <link rel="icon" type="image/png" sizes="48x48" href="img/favicon-48x48.png">`);
    console.log(`  <link rel="icon" type="image/png" sizes="96x96" href="img/favicon-96x96.png">`);
    console.log(`  <link rel="icon" type="image/png" sizes="192x192" href="img/favicon-192x192.png">`);
    console.log(`  <link rel="apple-touch-icon" sizes="180x180" href="img/apple-touch-icon.png">`);
    console.log(`  <link rel="shortcut icon" href="img/favicon.ico">`);
    console.log('\n✨ Done!\n');
}

generateFavicons().catch(console.error);
