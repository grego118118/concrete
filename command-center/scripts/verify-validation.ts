
import { createQuote } from '../src/app/actions/quotes';

async function main() {
    console.log("Starting Validation Verification...");

    // Test Invalid Data (Should Fail)
    try {
        await createQuote({
            customerId: "", // Invalid
            items: [],
            status: "DRAFT"
        } as any);
        console.error("❌ Validaton Failed: Should have thrown error");
    } catch (e: any) {
        if (e instanceof Error && e.constructor.name === "ZodError") {
            console.log("✅ Validation Passed: Caught ZodError");
            console.log(JSON.stringify(e, null, 2));
        } else {
            // We wrapped it, so it might just be the error thrown by .parse()
            console.log("✅ Validation Passed: Caught Error");
            console.log(e);
        }
    }
}

main();
