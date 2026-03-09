
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAsyncEmail() {
    try {
        // 1. Get a Quote
        const quote = await prisma.quote.findFirst();
        if (!quote) {
            console.log("No quotes found to test.");
            return;
        }
        console.log(`Testing with Quote ID: ${quote.id} (${quote.number})`);

        // 2. Call Async API
        const response = await fetch("http://localhost:3000/api/quotes/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteId: quote.id }),
        });

        const data = await response.json();
        console.log("API Response:", response.status, data);

        if (!data.taskName) {
            console.error("Failed to get taskName");
            return;
        }

        // 3. Poll Status
        console.log("Polling status...");
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            const statusRes = await fetch(`http://localhost:3000/api/tradeops/sync-status?taskName=${encodeURIComponent(data.taskName)}`);
            const statusData = await statusRes.json();
            console.log(`Attempt ${attempts}: Status = ${statusData.status}`);

            if (statusData.status === 'COMPLETED' || statusData.status === 'FAILED') {
                clearInterval(interval);
                console.log("Final Result:", statusData);
            }

            if (attempts > 10) {
                clearInterval(interval);
                console.log("Timeout waiting for status.");
            }
        }, 2000);

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testAsyncEmail();
