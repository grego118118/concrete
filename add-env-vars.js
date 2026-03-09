const { execSync } = require('child_process');

const envVars = {
    SMTP_HOST: "smtpout.secureserver.net",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: "quotes@pioneerconcretecoatings.com",
    SMTP_PASS: "Godfrey!2023171",
    SMTP_FROM_NAME: "Pioneer Concrete Coatings LLC"
};

for (const [key, value] of Object.entries(envVars)) {
    console.log(`Adding ${key} to production...`);
    try {
        // Remove existing to avoid "Variable already exists" error
        try {
            execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
        } catch (e) {
            // It might not exist, which is fine
        }

        execSync(`npx vercel env add ${key} production`, {
            input: value,
            stdio: ['pipe', 'inherit', 'inherit']
        });
        console.log(`Successfully added ${key}`);
    } catch (e) {
        console.error(`Failed to add ${key}:`, e.message);
    }
}

console.log('Finished uploading environment variables. Triggering redeployment...');
try {
    execSync('npx vercel --prod --yes', { stdio: 'inherit' });
    console.log('Successfully triggered redeployment.');
} catch (e) {
    console.error('Failed to trigger redeployment:', e.message);
}
