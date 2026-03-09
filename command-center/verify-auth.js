
async function checkAuth() {
    try {
        console.log("Checking Auth Session...");
        const res = await fetch('http://localhost:3000/api/auth/session');
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        const text = await res.text();
        console.log("Body:", text.substring(0, 500));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
checkAuth();
