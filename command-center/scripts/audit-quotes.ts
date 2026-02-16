
import { db } from '../src/lib/db';

async function main() {
    console.log("Fetching all quote IDs via raw SQL...");
    const quotes = await db.$queryRaw<{ id: string }[]>`SELECT id FROM "Quote"`;
    console.log(`Found ${quotes.length} quotes.`);

    for (const q of quotes) {
        process.stdout.write(`Checking ${q.id}... `);
        try {
            // Simulate getQuote
            const fullQuote = await db.quote.findUnique({
                where: { id: q.id },
                include: { customer: true, items: true }
            });

            if (!fullQuote) {
                console.log("NOT FOUND (returned null)");
            } else if (!fullQuote.customer) {
                console.log("MISSING CUSTOMER (returned valid object but null customer)");
            } else {
                console.log("OK");
            }
        } catch (error: any) {
            console.log(`FAILED: ${error.message}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
