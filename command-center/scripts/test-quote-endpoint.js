async function main() {
    try {
        const response = await fetch('http://localhost:3000/api/quotes/send', {
            method: 'POST',
            body: JSON.stringify({ quoteId: 'cm6sz4z84000jvy9w19ik2pku' }), // Mock ID
            headers: { 'Content-Type': 'application/json' }
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response Body (Raw):", text);

        try {
            console.log("Parsed JSON:", JSON.parse(text));
        } catch (e) {
            console.error("Failed to parse JSON:", e.message);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
main();
