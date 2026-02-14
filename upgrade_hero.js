
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'assets', 'images');
const sourceFile = path.join(imagesDir, 'hero_upload_final.jpg');
const targetWebP = path.join(imagesDir, 'hero-garage.webp');
const targetJpg = path.join(imagesDir, 'hero-garage.jpg');

async function upgradeHero() {
    console.log('Starting high-res hero upgrade...');

    if (!fs.existsSync(sourceFile)) {
        console.error('Source file After.png not found!');
        process.exit(1);
    }

    // Generate high-res WebP (1920px width, quality 90 for detail)
    console.log('Generating HD WebP...');
    await sharp(sourceFile)
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 90, effort: 6 }) // Higher effort for better compression/quality ratio
        .toFile(targetWebP);

    // Generate high-res JPG (1920px width, quality 90)
    console.log('Generating HD JPG...');
    await sharp(sourceFile)
        .resize(1920, null, { withoutEnlargement: true })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(targetJpg);

    console.log('Hero image upgraded successfully!');
}

upgradeHero().catch(err => console.error(err));
