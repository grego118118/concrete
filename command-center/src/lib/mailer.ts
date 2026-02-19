import nodemailer from "nodemailer";

const smtpHost = (process.env.SMTP_HOST || "smtpout.secureserver.net").trim();
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

console.log(`[MAILER] Configured transporter with host: "${smtpHost}" on port: ${smtpPort} (secure: ${smtpSecure})`);

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
    const fromEmail = (process.env.SMTP_USER || "").trim();

    return transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
    });
}
