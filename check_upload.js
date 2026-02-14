
const sharp = require('sharp');
const path = require('path');

const uploadPath = String.raw`C:\Users\grego\.gemini\antigravity\brain\e83d06ed-cdca-4f4a-8a2f-60ceec3bb484\uploaded_image_1769037960508.png`;

async function checkUpload() {
    try {
        const metadata = await sharp(uploadPath).metadata();
        console.log(`Upload Dimensions: ${metadata.width}x${metadata.height}`);
        console.log(`Format: ${metadata.format}`);
    } catch (e) {
        console.error("Error reading image:", e);
    }
}

checkUpload();
