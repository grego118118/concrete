
import { db } from '../src/lib/db';

async function main() {
    const targetId = 'cmlpful0q0007ih040mfh1khx'; // FH1KHX
    console.log(`Attempting to delete quote ${targetId} manually...`);

    try {
        // 1. Disconnect Job
        await db.job.updateMany({
            where: { quoteId: targetId },
            data: { quoteId: null }
        });
        console.log("Job disconnected.");

        // 2. Delete Invoices
        await db.invoice.deleteMany({
            where: { quoteId: targetId }
        });
        console.log("Invoices deleted.");

        // 3. Delete Quote
        await db.quote.delete({
            where: { id: targetId }
        });
        console.log("Quote deleted.");

        console.log("SUCCESS: Manual deletion complete.");
    } catch (error: any) {
        console.error("FAILURE:", error);
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
