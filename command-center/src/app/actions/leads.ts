"use server";

import { spawn, execSync } from "child_process";
import path from "path";
import fs from "fs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const SCRAPER_PATH = path.join(process.cwd(), "..", "scraper", "scraper.py");
const LEADS_CSV_PATH = path.join(process.cwd(), "..", "leads.csv");
const LOG_PATH = path.join(process.cwd(), "..", "scraper", "scraper.log");
const PID_PATH = path.join(process.cwd(), "..", "scraper", "scraper.pid");

export async function runScraper() {
    return new Promise((resolve, reject) => {
        console.log("Starting scraper at:", SCRAPER_PATH);

        // Ensure log directory exists
        const logDir = path.dirname(LOG_PATH);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // Clear previous log
        fs.writeFileSync(LOG_PATH, `[${new Date().toISOString()}] Scraper started\n`);

        const pythonProcess = spawn("python", ["-u", SCRAPER_PATH]);

        // Save PID so we can stop the scraper later
        if (pythonProcess.pid) {
            fs.writeFileSync(PID_PATH, pythonProcess.pid.toString());
        }

        pythonProcess.stdout.on("data", (data) => {
            const msg = data.toString();
            fs.appendFileSync(LOG_PATH, msg);
        });

        pythonProcess.stderr.on("data", (data) => {
            const msg = `ERROR: ${data.toString()}`;
            fs.appendFileSync(LOG_PATH, msg);
        });

        pythonProcess.on("close", async (code) => {
            // Clean up PID file
            try { fs.unlinkSync(PID_PATH); } catch { }

            const endMsg = `\n[${new Date().toISOString()}] Scraper finished with code ${code}\n`;
            fs.appendFileSync(LOG_PATH, endMsg);

            if (code === 0) {
                // Auto-import leads to database when scraper finishes
                try {
                    await importLeadsToDatabase();
                    fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] Leads imported to database\n`);
                } catch (err) {
                    fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] DB import error: ${err}\n`);
                }
                revalidatePath("/");
                revalidatePath("/crm/leads");
                resolve({ success: true });
            } else {
                reject({ success: false, code });
            }
        });
    });
}

export async function stopScraper() {
    try {
        let killed = false;

        // Method 1: Try PID file first
        if (fs.existsSync(PID_PATH)) {
            const pid = fs.readFileSync(PID_PATH, "utf-8").trim();
            if (pid) {
                try {
                    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
                    killed = true;
                } catch { }
            }
            try { fs.unlinkSync(PID_PATH); } catch { }
        }

        // Method 2: Find python scraper.py processes by command line
        if (!killed) {
            try {
                const output = execSync(
                    'wmic process where "commandline like \'%scraper.py%\'" get processid /format:list',
                    { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] }
                );
                const pids = output.match(/ProcessId=(\d+)/g);
                if (pids && pids.length > 0) {
                    for (const match of pids) {
                        const pid = match.replace("ProcessId=", "");
                        try {
                            execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
                            killed = true;
                        } catch { }
                    }
                }
            } catch { }
        }

        if (killed) {
            fs.appendFileSync(LOG_PATH, `\n[${new Date().toISOString()}] Scraper stopped by user\n`);
            return { stopped: true, error: null };
        }
        return { stopped: false, error: "No scraper process found" };
    } catch (error: any) {
        return { stopped: false, error: error.message };
    }
}

export async function getScraperStatus() {
    try {
        if (!fs.existsSync(LOG_PATH)) {
            return { active: false, lastMessage: "" };
        }

        const stats = fs.statSync(LOG_PATH);
        const lastModified = stats.mtimeMs;
        const now = Date.now();

        // If log was modified in the last 30 seconds, consider it active
        const active = (now - lastModified) < 30000;

        const content = fs.readFileSync(LOG_PATH, "utf-8");
        const lines = content.trim().split("\n");
        const lastMessage = lines[lines.length - 1] || "";

        return { active, lastMessage };
    } catch (error) {
        return { active: false, lastMessage: "" };
    }
}

export async function getScrapedLeadsCount() {
    try {
        let csvCount = 0;
        if (fs.existsSync(LEADS_CSV_PATH)) {
            const content = fs.readFileSync(LEADS_CSV_PATH, "utf-8");
            const lines = content.trim().split("\n");
            csvCount = Math.max(0, lines.length - 1);
        }

        // Also get DB count
        const dbCount = await db.customer.count({
            where: { leadSource: "SCRAPER" }
        });

        return { csvCount, dbCount };
    } catch (error) {
        console.error("Error reading leads:", error);
        return { csvCount: 0, dbCount: 0 };
    }
}

/**
 * Parse leads.csv and import each lead into the database as a Customer.
 * ONLY imports leads that have a real email address.
 * Skips duplicates by checking phone number or name+city.
 */
export async function importLeadsToDatabase() {
    try {
        if (!fs.existsSync(LEADS_CSV_PATH)) {
            return { imported: 0, skipped: 0, noEmail: 0, error: null };
        }

        const content = fs.readFileSync(LEADS_CSV_PATH, "utf-8");
        const lines = content.trim().split("\n");

        if (lines.length <= 1) {
            return { imported: 0, skipped: 0, noEmail: 0, error: null };
        }

        // Get the business
        const business = await db.business.findFirst();
        if (!business) {
            return { imported: 0, skipped: 0, noEmail: 0, error: "No business found" };
        }

        // Parse CSV manually (handle quoted fields)
        const header = parseCSVLine(lines[0]);
        const nameIdx = header.indexOf("Name");
        const phoneIdx = header.indexOf("Phone");
        const websiteIdx = header.indexOf("Website");
        const emailIdx = header.indexOf("Email");
        const addressIdx = header.indexOf("Address");
        const cityIdx = header.indexOf("City");
        const categoryIdx = header.indexOf("Category");

        let imported = 0;
        let skipped = 0;
        let noEmail = 0;

        for (let i = 1; i < lines.length; i++) {
            const fields = parseCSVLine(lines[i]);

            const name = fields[nameIdx] || "Unknown";
            const phone = cleanPhone(fields[phoneIdx] || "");
            const rawEmail = fields[emailIdx] || "";
            const website = fields[websiteIdx] || "";
            const address = (addressIdx >= 0 ? fields[addressIdx] : "") || "";
            const city = fields[cityIdx] || "";
            const category = fields[categoryIdx] || "";

            // Skip if no meaningful data
            if (!name || name === "Unknown") {
                skipped++;
                continue;
            }

            // Clean the email
            const cleanEmail = (rawEmail && rawEmail !== "N/A") ? rawEmail.split(",")[0].trim() : "";
            const hasRealEmail = cleanEmail && cleanEmail.includes("@") && !cleanEmail.includes("placeholder");

            // SKIP leads without BOTH email and phone — need at least one contact method
            if (!hasRealEmail && !phone) {
                noEmail++;
                continue;
            }

            // Check for duplicate by phone or name+city
            const existing = await db.customer.findFirst({
                where: {
                    OR: [
                        ...(phone ? [{ phone }] : []),
                        { name, city: city || undefined },
                        { email: cleanEmail }
                    ],
                    businessId: business.id
                }
            });

            if (existing) {
                skipped++;
                continue;
            }

            // Parse city and state from the city field (e.g. "Palmer, MA")
            const cityName = city.replace(/,\s*(MA|CT|RI|NH|VT|NY)$/i, "").trim();
            const stateMatch = city.match(/,\s*(MA|CT|RI|NH|VT|NY)$/i);
            const state = stateMatch ? stateMatch[1].toUpperCase() : null;

            // Clean address
            const cleanAddress = (address && address !== "N/A") ? address.trim() : null;

            // Clean website
            const cleanWebsite = (website && website !== "N/A") ? website.trim() : "";

            await db.customer.create({
                data: {
                    name,
                    email: hasRealEmail ? cleanEmail : `phone-only-${phone}@internal.scraper`,
                    phone: phone || null,
                    address: cleanAddress,
                    city: cityName || null,
                    state,
                    leadSource: "SCRAPER",
                    leadScore: 50,
                    notes: [
                        `Category: ${category}`,
                        cleanWebsite ? `Website: ${cleanWebsite}` : null,
                        "Source: Google Maps Scraper"
                    ].filter(Boolean).join("\n"),
                    businessId: business.id
                }
            });
            imported++;
        }

        revalidatePath("/");
        revalidatePath("/crm/leads");
        return { imported, skipped, noEmail, error: null };
    } catch (error: any) {
        console.error("Error importing leads:", error);
        return { imported: 0, skipped: 0, noEmail: 0, error: error.message };
    }
}

/**
 * Delete leads by IDs.
 */
export async function deleteLeads(leadIds: string[]) {
    try {
        const deleted = await db.customer.deleteMany({
            where: { id: { in: leadIds } }
        });
        revalidatePath("/crm/leads");
        revalidatePath("/");
        return { deleted: deleted.count, error: null };
    } catch (error: any) {
        console.error("Error deleting leads:", error);
        return { deleted: 0, error: error.message };
    }
}

/** Parse a CSV line handling quoted fields */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

/** Clean phone number to consistent format */
function cleanPhone(phone: string): string {
    if (!phone || phone === "N/A") return "";
    // Remove +1 prefix and non-digits
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
        return digits.slice(1);
    }
    return digits;
}
