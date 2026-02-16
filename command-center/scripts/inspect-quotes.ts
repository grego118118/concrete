
import { db } from '../src/lib/db';

async function main() {
    console.log("Fetching all quotes...");
    const quotes = await db.quote.findMany({
        include: {
            customer: true,
            items: true,
            job: true,
            invoices: true
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${quotes.length} quotes.`);

    for (const q of quotes) {
        console.log(`--------------------------------------------------`);
        console.log(`ID: ${q.id}`);
        console.log(`Number: ${q.number}`);
        console.log(`Created: ${q.createdAt.toISOString()}`);
        console.log(`Customer: ${q.customer ? q.customer.name : 'MISSING'}`);
        console.log(`Items: ${q.items.length}`);
        console.log(`Jobs: ${q.job.length}`);
        console.log(`Invoices: ${q.invoices.length}`);

        if (!q.customer) {
            console.error(`!!! CRITICAL: Quote ${q.id} has NO CUSTOMER !!!`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
