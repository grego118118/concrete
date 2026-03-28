import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const resendSecret = process.env.RESEND_API_KEY;

async function testResend() {
  if (!resendSecret) {
    console.error('❌ RESEND_API_KEY not found in .env');
    process.exit(1);
  }

  const resend = new Resend(resendSecret);

  console.log('🚀 Sending test email via Resend...');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pioneer Concrete <quotes@pioneerconcretecoatings.com>', // Real verified address
      to: 'greg@gowebautomations.com', // Sending to the user
      subject: 'Resend REAL Integration Test',
      html: `
        <h1>It works! 🚀</h1>
        <p>This email was sent from your Command Center using the new Resend integration.</p>
        <p>Next step: Verify your domain in Resend to send from <strong>quotes@pioneerconcretecoatings.com</strong>.</p>
      `,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
    } else {
      console.log('✅ Success! Email sent. ID:', data?.id);
      console.log('Check your inbox at greg@gowebautomations.com');
    }
  } catch (err) {
    console.error('💥 Critical Error:', err);
  }
}

testResend();
