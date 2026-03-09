
async function checkCsrf() {
    try {
        console.log("Checking CSRF Token...");
        const res = await fetch('http://localhost:3000/api/auth/csrf');
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        const text = await res.text();
        console.log("Body:", text.substring(0, 500));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
checkCsrf();
