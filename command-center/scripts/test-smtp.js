
require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

async function main() {
    console.log('Testing SMTP Connection...');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587, // Try 587 for STARTTLS
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM_NAME ? `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>` : process.env.SMTP_USER,
            to: "greg@gowebautomations.com", // Send to the admin user for testing
            subject: "Test Email from Command Center Debugger",
            text: "If you receive this, SMTP is working correctly.",
            html: "<b>If you receive this, SMTP is working correctly.</b>",
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

main().catch(console.error);
