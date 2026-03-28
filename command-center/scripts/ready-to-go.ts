import { db } from "../src/lib/db";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function checkSystem() {
    console.log("🚀 Starting System Diagnosis...\n");

    // 1. Database & Schema
    console.log("📁 1. Checking Database...");
    try {
        await db.$connect();
        // Check if the new column exists by querying the model
        // @ts-ignore
        const connectionCount = await db.quickBooksConnection.count();
        console.log(`✅ Database connected. Found ${connectionCount} connections.\n`);
    } catch (error: any) {
        console.error("❌ Database/Schema Error: Have you run 'npx prisma migrate dev' and 'npx prisma generate' yet?");
        console.error(`Error: ${error.message}\n`);
    }

    // 2. QuickBooks Config
    console.log("📊 2. Checking QuickBooks Configuration...");
    const qbClientId = process.env.QUICKBOOKS_CLIENT_ID;
    const qbSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
    const qbRedirect = process.env.QUICKBOOKS_REDIRECT_URI;
    
    if (!qbClientId || qbClientId.includes("...")) {
        console.error("❌ QUICKBOOKS_CLIENT_ID is missing or not configured.");
    } else {
        console.log("✅ QuickBooks Client ID found.");
    }
    
    if (qbRedirect && qbRedirect.includes("localhost") && process.env.NODE_ENV === "production") {
        console.warn("⚠️  WARNING: QUICKBOOKS_REDIRECT_URI is pointing to localhost but you seem to be in production.");
    }
    console.log("");

    // 3. SMTP Config
    console.log("📧 3. Checking SMTP Configuration...");
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("✅ SMTP Authentication Successful!\n");
    } catch (error: any) {
        console.error("❌ SMTP Authentication Failed (535).");
        console.error("Suggestions:");
        console.error(" - Verify SMTP_USER and SMTP_PASS are correct.");
        console.error(" - If using Microsoft 365, ensure SMTP Auth is enabled for this mailbox.");
        console.error(" - For GoDaddy, try port 587 with secure: false or create an App Password.\n");
    }

    console.log("🏁 Diagnosis Complete.");
}

checkSystem().catch(console.error);
