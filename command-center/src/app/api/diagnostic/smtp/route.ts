
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
    try {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS ? "********" : undefined;
        const secure = process.env.SMTP_PORT === "465";

        console.log("Diagnostic: Checking SMTP config...", { host, port, user, passObscured: pass, secure });

        if (!host || !port || !user || !process.env.SMTP_PASS) {
            return NextResponse.json(
                {
                    error: "Missing environment variables",
                    debug: { host, port, user, passExists: !!process.env.SMTP_PASS }
                },
                { status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure,
            auth: {
                user,
                pass: process.env.SMTP_PASS,
            },
        });

        console.log("Diagnostic: Verifying SMTP connection...");
        await transporter.verify();
        console.log("Diagnostic: SMTP connection successful!");

        return NextResponse.json({ success: true, message: "SMTP connection verified successfully" });
    } catch (error: any) {
        console.error("Diagnostic: SMTP connection failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                code: error.code,
                command: error.command
            },
            { status: 500 }
        );
    }
}
