import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtpout.secureserver.net",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_PORT === "465", // GoDaddy uses SSL on port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

console.log("[MAILER] Configured transporter with host:", process.env.SMTP_HOST || "using default");

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("[MAILER] SMTP Connection Error:", error);
    } else {
        console.log("[MAILER] SMTP Server is ready to take our messages");
    }
});

export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: { filename: string; content: Buffer }[];
}) {
    const fromName = process.env.SMTP_FROM_NAME || "Pioneer Concrete";
    const fromEmail = process.env.SMTP_USER;

    return transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
    });
}
