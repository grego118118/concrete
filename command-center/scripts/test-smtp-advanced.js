
require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

async function testConfig(name, config) {
    console.log(`\n--- Testing Configuration: ${name} ---`);
    const transporter = nodemailer.createTransport({
        ...config,
        logger: true,
        debug: true,
    });

    try {
        await transporter.verify();
        console.log(`SUCCESS: ${name} connected and authenticated!`);
        return true;
    } catch (error) {
        console.error(`FAILED: ${name}`);
        console.error(error.message);
        if (error.response) console.error("Server Response:", error.response);
        return false;
    }
}

async function main() {
    const baseConfig = {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false // Sometimes needed for self-signed or intermediate certs
        }
    };

    // 1. Standard SSL (Port 465)
    await testConfig("Port 465 (SSL)", {
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        ...baseConfig
    });

    // 2. STARTTLS (Port 587)
    await testConfig("Port 587 (STARTTLS)", {
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        ...baseConfig
    });
}

main();
