const sharp = require('sharp');
async function test() {
    try {
        const formats = await sharp.format;
        console.log('Supported formats:', JSON.stringify(formats, null, 2));
        console.log('HEIF support:', formats.heif ? 'Yes' : 'No');
    } catch (e) {
        console.error('Error checking sharp support:', e);
    }
}
test();
