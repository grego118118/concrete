
const leadData = {
    name: "Noah Hoskins",
    phone: "8022493371",
    email: "nhoskins@putneyschool.org",
    address: "418 Houghton Brook Rd, Putney, VT 05346, USA",
    square_footage: "525",
    project_type: "Commercial - Industrial",
    floor_condition: "Not sure - would like an assessment",
    desired_finish: "Solid color",
    project_timeline: "3+ months / just planning",
    notes: "We are planning to install a cheese making room in our student run dairy. Could we talk about options? Thanks!"
};

async function addLead() {
    try {
        console.log("Adding lead...");
        const response = await fetch('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (e) {
        console.error("Error:", e);
    }
}

addLead();
