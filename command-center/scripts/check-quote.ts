
import { db } from '../src/lib/db';

async function main() {
    console.log("Checking for recent quotes...");
    const quotes = await db.quote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, number: true, createdAt: true, customerId: true }
    });
    console.log("Recent 5 quotes:", JSON.stringify(quotes, null, 2));

    // Check for the specific ID from the screenshot if possible (partial match)
    // ID from screenshot: cmlpfwt6z000bih0495dg1oyy
    const specificId = "cmlpfwt6z000bih0495dg1oyy";
    const specificQuote = await db.quote.findUnique({
        where: { id: specificId }
    });

    if (specificQuote) {
        console.log(`FOUND QUOTE ${specificId}:`, specificQuote);
    } else {
        console.log(`QUOTE ${specificId} NOT FOUND.`);
    }
}

main();
