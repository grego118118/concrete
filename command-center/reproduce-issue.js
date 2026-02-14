
const formspreePayload = {
    "_id": "submission_123",
    "form_data": {
        "name": "Formspree User",
        "email": "formspree@example.com",
        "phone": "555-9999",
        "address": "999 Webhook Lane",
        "project_type": "Patio",
        "notes": "Testing Webhook integration"
    },
    "submitted_at": "2023-10-27T10:00:00Z"
};

async function testWebhook() {
    try {
        console.log("Sending Formspree-style payload...");
        const response = await fetch('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formspreePayload)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testWebhook();
