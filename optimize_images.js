
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'assets', 'images');
const backupDir = path.join(__dirname, 'assets', 'images_backup');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Helper to process specific file
async function optimizeStart() {
    console.log('Starting image optimization...');

    // 1. After.png (3.5MB) -> Resize and convert to WebP/JPG
    const afterFile = 'After.png';
    if (fs.existsSync(path.join(imagesDir, afterFile))) {
        console.log(`Optimizing ${afterFile}...`);
        // Backup
        fs.copyFileSync(path.join(imagesDir, afterFile), path.join(backupDir, afterFile));

        // Resize to max width 1200px, quality 80, convert to jpeg for better compression for photos, or png if transparency needed. 
        // Assuming it's a photo based on name.
        await sharp(path.join(imagesDir, afterFile))
            .resize(1200, null, { withoutEnlargement: true })
            .toFormat('jpeg', { quality: 80 })
            .toFile(path.join(imagesDir, 'After.jpg')); // Save as JPG

        // Update to WebP version as well
        await sharp(path.join(imagesDir, afterFile))
            .resize(1200, null, { withoutEnlargement: true })
            .toFormat('webp', { quality: 80 })
            .toFile(path.join(imagesDir, 'After.webp'));

        console.log(`Optimized ${afterFile}`);
    }

    // 2. MassConcreteLogo.png (670KB) -> Resize/Optimize
    const logoFile = 'MassConcreteLogo.png';
    if (fs.existsSync(path.join(imagesDir, logoFile))) {
        console.log(`Optimizing ${logoFile}...`);
        fs.copyFileSync(path.join(imagesDir, logoFile), path.join(backupDir, logoFile));

        await sharp(path.join(imagesDir, logoFile))
            .resize(800, null, { withoutEnlargement: true })
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(path.join(imagesDir, 'MassConcreteLogo_opt.png'));

        fs.renameSync(path.join(imagesDir, 'MassConcreteLogo_opt.png'), path.join(imagesDir, logoFile));
        console.log(`Optimized ${logoFile}`);
    }

    // 3. Hero image optimization
    const heroFile = 'hero-garage.jpg.jpg';
    if (fs.existsSync(path.join(imagesDir, heroFile))) {
        console.log(`Optimizing ${heroFile}...`);
        fs.copyFileSync(path.join(imagesDir, heroFile), path.join(backupDir, heroFile));

        await sharp(path.join(imagesDir, heroFile))
            .resize(1920, null, { withoutEnlargement: true })
            .toFormat('webp', { quality: 80 })
            .toFile(path.join(imagesDir, 'hero-garage.webp'));

        // Also optimize original jpg
        await sharp(path.join(imagesDir, heroFile))
            .resize(1920, null, { withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(path.join(imagesDir, 'hero-garage_opt.jpg'));

        fs.renameSync(path.join(imagesDir, 'hero-garage_opt.jpg'), path.join(imagesDir, heroFile));
        console.log(`Optimized ${heroFile}`);
    }

    console.log('Image optimization complete.');
}

optimizeStart().catch(err => console.error(err));
