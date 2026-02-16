
import { createQuote } from '../src/app/actions/quotes';
import { db } from '../src/lib/db';

async function main() {
    console.log("Starting Verification...");

    // 1. Get a customer
    const customer = await db.customer.findFirst();
    if (!customer) {
        console.error("No customers found.");
        return;
    }

    // 2. Test Invalid Data (Should Fail)
    console.log("\nTest 1: Invalid Data");
    try {
        await createQuote({
            customerId: "", // Invalid
            items: [],
            status: "DRAFT"
        });
        console.error("❌ Test 1 Failed: Should have thrown validation error");
    } catch (e: any) {
        if (e.issues) {
            console.log("✅ Test 1 Passed: Caught validation error");
            console.log(JSON.stringify(e.issues, null, 2));
        } else {
            console.error("❌ Test 1 Failed: Unexpected error", e);
        }
    }

    // 3. Test Valid Data (Should Success - but allow redirect error)
    console.log("\nTest 2: Valid Data");
    try {
        await createQuote({
            customerId: customer.id,
            items: [
                { description: "Test Item", qty: 1, price: 100, unit: "ea" }
            ],
            status: "DRAFT",
            scopeArea: 100,
            baseRate: 5
        });
        console.log("✅ Test 2 Passed: No error (or redirect)");
    } catch (e: any) {
        if (e.message === "NEXT_REDIRECT" || e.message.includes("NEXT_REDIRECT")) {
            console.log("✅ Test 2 Passed: Redirect triggered (Success)");
        } else {
            console.error("❌ Test 2 Failed:", e);
        }
    }
}

main().catch(console.error); // .finally(() => db.$disconnect()); 
// Note: importing server actions directly in a script like this might lack context (Next.js context).
// But since we are testing logic, it might work if environment is set up.
// Actually, 'use server' functions can't be easily imported and run in a standalone node script without Next.js build context usually.
// Let's see if we can just trigger it. If not, we rely on manual verification.
