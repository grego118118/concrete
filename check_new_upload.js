
const sharp = require('sharp');
const path = require('path');

const uploadPath = String.raw`C:\Users\grego\.gemini\antigravity\brain\e83d06ed-cdca-4f4a-8a2f-60ceec3bb484\uploaded_image_1769038693256.jpg`;

async function checkUpload() {
    try {
        const metadata = await sharp(uploadPath).metadata();
        console.log(`Upload Dimensions: ${metadata.width}x${metadata.height}`);
        console.log(`Format: ${metadata.format}`);
        console.log(`Size: ${metadata.size}`);
    } catch (e) {
        console.error("Error reading image:", e);
    }
}

checkUpload();
