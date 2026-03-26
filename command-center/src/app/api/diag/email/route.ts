import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
    const smtpHost = (process.env.SMTP_HOST || "smtpout.secureserver.net").trim();
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const config = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass ? (smtpPass.length > 4 ? `****${smtpPass.slice(-4)}` : "****") : "MISSING",
        },
    };

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        await transporter.verify();

        return NextResponse.json({
            success: true,
            message: "SMTP Connection Verified!",
            config
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            config
        }, { status: 500 });
    }
}
