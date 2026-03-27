import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSmtp() {
    const configs = [
        {
            name: 'GoDaddy Legacy (465)',
            host: 'smtpout.secureserver.net',
            port: 465,
            secure: true
        },
        {
            name: 'Office365/Microsoft (587)',
            host: 'smtp.office365.com',
            port: 587,
            secure: false
        }
    ];

    for (const config of configs) {
        console.log(`\n--- Testing ${config.name} ---`);
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // For 587
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            }
        });

        try {
            console.log(`Connecting to ${config.host}:${config.port}...`);
            await transporter.verify();
            console.log(`[${config.name}] SUCCESS!`);
            return;
        } catch (error: any) {
            console.error(`[${config.name}] FAILED:`, error.message);
        }
    }
    console.log('\n--- ALL TESTS FAILED ---');
}

testSmtp();
