
import { db } from '../src/lib/db';

async function main() {
    console.log("Fetching all quotes...");
    include: {
        customer: true,
            items: true,
                job: true,
                    invoice: true
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
    console.log(`Job: ${q.job ? 'YES' : 'NO'}`);
    console.log(`Invoice: ${q.invoice ? 'YES' : 'NO'}`);

    if (!q.customer) {
        console.error(`!!! CRITICAL: Quote ${q.id} has NO CUSTOMER !!!`);
    }
}
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
