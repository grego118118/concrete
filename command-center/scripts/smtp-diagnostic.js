
require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

const credentials = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
};

const configs = [
    {
        name: "GoDaddy Workspace (SSL 465)",
        host: "smtpout.secureserver.net",
        port: 465,
        secure: true,
    },
    {
        name: "GoDaddy Workspace (STARTTLS 587)",
        host: "smtpout.secureserver.net",
        port: 587,
        secure: false,
    },
    {
        name: "Microsoft 365 (STARTTLS 587)",
        host: "smtp.office365.com",
        port: 587,
        secure: false,
    },
    {
        name: "Microsoft 365 Alternative (Port 25)",
        host: "smtp.office365.com",
        port: 25,
        secure: false,
    }
];

async function runTest(config) {
    console.log(`\nTesting: ${config.name}...`);
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: credentials,
        tls: { rejectUnauthorized: false },
        debug: true,
        logger: false, // Turn off logger to keep output readable, we'll catch errors
    });

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS: ${config.name} is working!`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${config.name}`);
        console.log(`   Error: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log("Starting SMTP Diagnostic...");
    console.log(`Testing with User: ${credentials.user}`);

    for (const config of configs) {
        const success = await runTest(config);
        if (success) {
            console.log("\n--- FOUND WORKING CONFIGURATION ---");
            console.log(`Host: ${config.host}`);
            console.log(`Port: ${config.port}`);
            console.log(`Secure: ${config.secure}`);
            console.log("------------------------------------");
            // Optionally stop if we found one, but let's check all
        }
    }
}

main();
