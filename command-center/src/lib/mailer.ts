import nodemailer from "nodemailer";
import { Resend } from "resend";

const globalForApp = global as unknown as { transporter: nodemailer.Transporter };

const smtpHost = (process.env.SMTP_HOST || "smtpout.secureserver.net").trim();
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

// Initialization
export const transporter = globalForApp.transporter || nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (process.env.NODE_ENV !== 'production') globalForApp.transporter = transporter;

if (resend) {
    console.log(`[MAILER] Configured Resend (Primary) with FROM: ${process.env.SMTP_FROM_EMAIL}`);
} else {
    console.log(`[MAILER] Configured Nodemailer (Primary) with host: "${smtpHost}" on port: ${smtpPort}`);
}

export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: { filename: string; content: Buffer }[];
    replyTo?: string;
}) {
    const fromName = process.env.SMTP_FROM_NAME || "Pioneer Concrete Coatings";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "";
    const replyTo = options.replyTo || process.env.SMTP_USER || "";

    try {
        if (resend) {
            console.log(`[MAILER] Sending via Resend to: ${options.to}`);
            const { data, error } = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                attachments: options.attachments,
                reply_to: replyTo,
            });

            if (error) throw error;
            console.log(`[MAILER] Email sent via Resend: ${data?.id}`);
            return data;
        } else {
            console.log(`[MAILER] Sending via Nodemailer to: ${options.to}`);
            const info = await transporter.sendMail({
                from: `${fromName} <${fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                attachments: options.attachments,
                replyTo: replyTo,
            });
            console.log(`[MAILER] Email sent via Nodemailer: ${info.messageId}`);
            return info;
        }
    } catch (error: any) {
        console.error(`[MAILER] Failed to send email to ${options.to}:`, error.message);
        
        if (error.code === 'EAUTH') {
            console.error(`[MAILER] AUTHENTICATION FAILED (535). Check credentials.`);
        }
        
        throw error;
    }
}
