
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'assets', 'images');

async function checkMetadata() {
    const files = fs.readdirSync(imagesDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));

    console.log('Checking image dimensions...');
    console.log('----------------------------------------');
    console.log(String('Filename').padEnd(30) + String('Size').padEnd(15) + 'Dimensions');
    console.log('----------------------------------------');

    for (const file of files) {
        try {
            const filePath = path.join(imagesDir, file);
            const stats = fs.statSync(filePath);
            const metadata = await sharp(filePath).metadata();

            const sizeStr = (stats.size / 1024).toFixed(1) + ' KB';
            const dimStr = `${metadata.width}x${metadata.height}`;

            console.log(file.padEnd(30) + sizeStr.padEnd(15) + dimStr);
        } catch (e) {
            console.log(file.padEnd(30) + 'Error reading metadata');
        }
    }
}

checkMetadata();
