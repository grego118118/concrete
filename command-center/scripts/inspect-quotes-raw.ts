
import { db } from '../src/lib/db';

async function main() {
    console.log("Fetching all quotes via RAW SQL...");
    try {
        // Query raw to bypass Prisma validation
        const quotes: any[] = await db.$queryRaw`SELECT id, "customerId", "createdAt", status FROM "Quote" ORDER BY "createdAt" DESC`;

        console.log(`Found ${quotes.length} quotes.`);

        for (const q of quotes) {
            console.log(`ID: ${q.id} | Date: ${q.createdAt} | Customer: ${q.customerId} | Status: ${q.status}`);
            if (!q.customerId) {
                console.error(`!!! CRITICAL: Quote ${q.id} has NO CUSTOMER ID !!!`);
            }
        }
    } catch (e) {
        console.error("Raw query failed:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
