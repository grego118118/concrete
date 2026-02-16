
import { db } from '../src/lib/db';

async function main() {
    console.log("Checking for orphaned quotes...");

    // 1. Get a valid customer
    const validCustomer = await db.customer.findFirst();
    if (!validCustomer) {
        console.error("No customers found! Cannot fix orphaned quotes.");
        return;
    }
    console.log(`Using valid customer: ${validCustomer.name} (${validCustomer.id})`);

    // 2. Find quotes with invalid customerId using raw SQL
    const orphanedQuotes: any[] = await db.$queryRaw`
        SELECT id, "customerId" 
        FROM "Quote" 
        WHERE "customerId" NOT IN (SELECT id FROM "Customer")
    `;

    console.log(`Found ${orphanedQuotes.length} orphaned quotes.`);

    if (orphanedQuotes.length > 0) {
        console.log("Fixing orphaned quotes...");
        // 3. Update them to point to valid customer
        const result = await db.$executeRaw`
            UPDATE "Quote" 
            SET "customerId" = ${validCustomer.id}
            WHERE "customerId" NOT IN (SELECT id FROM "Customer")
        `;
        console.log(`Fixed ${result} quotes.`);
    } else {
        console.log("No orphaned quotes found.");
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
