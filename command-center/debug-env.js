require('dotenv').config();
const fs = require('fs');

console.log("Checking DATABASE_URL...");
const url = process.env.DATABASE_URL;

let output = "";
if (url) {
    output += "DATABASE_URL is defined.\n";
    output += `Length: ${url.length}\n`;
    output += `Starts with 'postgres://': ${url.startsWith("postgres://")}\n`;
    output += `Starts with 'postgresql://': ${url.startsWith("postgresql://")}\n`;
    output += `Contains 'neon.tech': ${url.includes("neon.tech")}\n`;
    output += `Contains 'localhost': ${url.includes("localhost")}\n`;
    // Print first 10 chars to verify protocol
    output += `Prefix: ${url.substring(0, 15)}...\n`;
} else {
    output += "DATABASE_URL is NOT defined in process.env\n";
}

fs.writeFileSync('env_log.txt', output);
console.log("Written to env_log.txt");
