
const crmData = {
    name: "Test Lead",
    email: "test@example.com",
    phone: "555-0100",
    address: "123 Test St",
    square_footage: "500",
    project_type: "Garage",
    floor_condition: "Cracked",
    desired_finish: "Flake",
    project_timeline: "ASAP",
    notes: "This is a test submission."
};

async function testLead() {
    try {
        const response = await fetch('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(crmData)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error(e);
    }
}

testLead();
