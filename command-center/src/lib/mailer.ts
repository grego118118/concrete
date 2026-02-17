import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net", // Hardcoded to fix EBADNAME env var issue
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // TLS for 587
    auth: {
        user: "quotes@pioneerconcretecoatings.com", // Hardcoded to rule out env var issues
        pass: "Godfrey!2023171", // Hardcoded to rule out env var issues with special chars
    },
});

console.log(`[MAILER] Configured transporter with hardcoded host: smtpout.secureserver.net on port: ${process.env.SMTP_PORT || 587}`);

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
