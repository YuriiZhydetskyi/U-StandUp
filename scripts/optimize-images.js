const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.join(__dirname, '..', 'src', 'img');
const PROJECT_ROOT = path.join(__dirname, '..');
const EXTENSIONS_TO_CONVERT = ['.jpg', '.jpeg', '.png'];
const EXTENSIONS_TO_SKIP = ['.svg', '.webp'];
const CODE_EXTENSIONS = ['.html', '.js', '.css', '.yaml', '.yml'];

// Files to skip (favicons must stay as PNG for browser compatibility)
const FILES_TO_SKIP = [
    'favicon',           // matches favicon*.png
    'apple-touch-icon',  // matches apple-touch-icon*.png
    'fovicon',           // matches fovicon*.png (source file for favicon generation)
];

// WebP quality (0-100)
const WEBP_QUALITY = 80;

async function findFilesToConvert() {
    const files = fs.readdirSync(IMG_DIR);
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        const nameWithoutExt = path.basename(file, ext).toLowerCase();

        // Skip files that match FILES_TO_SKIP prefixes
        const shouldSkip = FILES_TO_SKIP.some(prefix => nameWithoutExt.startsWith(prefix.toLowerCase()));
        if (shouldSkip) return false;

        return EXTENSIONS_TO_CONVERT.includes(ext);
    });
}

async function convertToWebP(filename) {
    const inputPath = path.join(IMG_DIR, filename);
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const outputPath = path.join(IMG_DIR, `${nameWithoutExt}.webp`);
    const inputStats = fs.statSync(inputPath);

    // Check if WebP already exists and is newer than source
    if (fs.existsSync(outputPath)) {
        const outputStats = fs.statSync(outputPath);
        if (outputStats.mtime >= inputStats.mtime) {
            console.log(`  ⏭️  ${nameWithoutExt}.webp is up to date, skipping`);
            return { converted: false, originalName: filename, newName: `${nameWithoutExt}.webp` };
        }
        console.log(`  🔄 ${nameWithoutExt}.webp is outdated, regenerating...`);
    }
    const inputSizeKB = (inputStats.size / 1024).toFixed(1);

    await sharp(inputPath)
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSizeKB = (outputStats.size / 1024).toFixed(1);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`  ✅ ${filename} (${inputSizeKB}KB) → ${nameWithoutExt}.webp (${outputSizeKB}KB) [-${savings}%]`);

    return {
        converted: true,
        originalName: filename,
        newName: `${nameWithoutExt}.webp`,
        savedBytes: inputStats.size - outputStats.size
    };
}

function findCodeFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Skip node_modules and .git
            if (item === 'node_modules' || item === '.git' || item === 'scripts') continue;
            findCodeFiles(fullPath, files);
        } else {
            const ext = path.extname(item).toLowerCase();
            if (CODE_EXTENSIONS.includes(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

function updateReferences(originalName, newName) {
    const codeFiles = findCodeFiles(PROJECT_ROOT);
    let totalReplacements = 0;

    for (const filePath of codeFiles) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Create regex patterns for different reference styles
        // Match: img/filename.jpg, ./img/filename.jpg, ../img/filename.jpg
        const patterns = [
            new RegExp(`img/${escapeRegex(originalName)}`, 'g'),
            new RegExp(`\\.\\./img/${escapeRegex(originalName)}`, 'g'),
            new RegExp(`\\./img/${escapeRegex(originalName)}`, 'g'),
            // Also match just the filename in case it's referenced directly
            new RegExp(`["']${escapeRegex(originalName)}["']`, 'g'),
        ];

        for (const pattern of patterns) {
            content = content.replace(pattern, (match) => {
                return match.replace(originalName, newName);
            });
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            const relativePath = path.relative(PROJECT_ROOT, filePath);
            const replacements = (originalContent.match(new RegExp(escapeRegex(originalName), 'g')) || []).length;
            console.log(`  📝 Updated ${relativePath} (${replacements} reference${replacements > 1 ? 's' : ''})`);
            totalReplacements += replacements;
        }
    }

    return totalReplacements;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function deleteOriginal(filename) {
    const filePath = path.join(IMG_DIR, filename);
    fs.unlinkSync(filePath);
    console.log(`  🗑️  Deleted ${filename}`);
}

async function main() {
    console.log('\n🖼️  Image Optimization Script\n');
    console.log('━'.repeat(50));

    const filesToConvert = await findFilesToConvert();

    if (filesToConvert.length === 0) {
        console.log('✨ No images to convert! All images are already in WebP or SVG format.\n');
        return;
    }

    console.log(`Found ${filesToConvert.length} image(s) to convert:\n`);
    filesToConvert.forEach(f => console.log(`  • ${f}`));
    console.log('\n' + '━'.repeat(50));
    console.log('Converting images...\n');

    let totalSavedBytes = 0;
    const results = [];

    for (const file of filesToConvert) {
        try {
            const result = await convertToWebP(file);
            results.push(result);
            if (result.savedBytes) {
                totalSavedBytes += result.savedBytes;
            }
        } catch (error) {
            console.log(`  ❌ Error converting ${file}: ${error.message}`);
        }
    }

    console.log('\n' + '━'.repeat(50));
    console.log('Updating code references...\n');

    let totalReplacements = 0;
    for (const result of results) {
        if (result.converted || result.originalName !== result.newName) {
            const replacements = updateReferences(result.originalName, result.newName);
            totalReplacements += replacements;
        }
    }

    console.log('\n' + '━'.repeat(50));
    console.log('Deleting original files...\n');

    for (const result of results) {
        if (result.converted) {
            deleteOriginal(result.originalName);
        }
    }

    console.log('\n' + '━'.repeat(50));
    console.log('📊 Summary:\n');
    console.log(`  • Images converted: ${results.filter(r => r.converted).length}`);
    console.log(`  • Code references updated: ${totalReplacements}`);
    console.log(`  • Space saved: ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n✨ Done!\n');
}

main().catch(console.error);
