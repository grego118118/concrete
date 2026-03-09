
import { db } from '../src/lib/db';

async function main() {
    const quoteNumber = process.argv[2] || "Q-1771345822329";
    console.log(`Checking decimals for quote: ${quoteNumber}`);

    const quote = await db.quote.findUnique({
        where: { number: quoteNumber },
        include: { items: true }
    });

    if (!quote) {
        console.error("Quote not found");
        return;
    }

    console.log("--- Quote Totals ---");
    console.log(`Subtotal: ${quote.subtotal} (Type: ${typeof quote.subtotal})`);
    console.log(`Tax:      ${quote.tax} (Type: ${typeof quote.tax})`);
    console.log(`Total:    ${quote.total} (Type: ${typeof quote.total})`);
    console.log(`Deposit:  ${quote.deposit} (Type: ${typeof quote.deposit})`);
    console.log(`Balance:  ${quote.balance} (Type: ${typeof quote.balance})`);
    console.log(`Cleanup:  ${quote.cleanupFee} (Type: ${typeof quote.cleanupFee})`);

    console.log("--- Items ---");
    quote.items.forEach((item, i) => {
        console.log(`Item ${i + 1}: ${item.description}`);
        console.log(`  Qty: ${item.quantity} | Price: ${item.unitPrice} | Total: ${item.total}`);
    });

    console.log("--- Scope ---");
    console.log(`Area: ${quote.scopeArea}`);
    console.log("Scope Data:", JSON.stringify(quote.scopeData, null, 2));
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
