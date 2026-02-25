import nodemailer from "nodemailer";

const globalForApp = global as unknown as { transporter: nodemailer.Transporter };

const smtpHost = (process.env.SMTP_HOST || "smtpout.secureserver.net").trim();
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

export const transporter = globalForApp.transporter || nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

if (process.env.NODE_ENV !== 'production') globalForApp.transporter = transporter;

console.log(`[MAILER] Configured transporter with host: "${smtpHost}" on port: ${smtpPort} (secure: ${smtpSecure})`);

console.log(`[MAILER] Configured transporter (Singleton)`);

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
