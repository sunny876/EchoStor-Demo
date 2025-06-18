// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import SendGrid mail package
import sgMail from '@sendgrid/mail';

console.log('Starting SendGrid direct test...');

// Extract environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

// Check if environment variables are set
console.log('API Key available:', !!SENDGRID_API_KEY);
console.log('From Email:', SENDGRID_FROM_EMAIL);

// Set API key
sgMail.setApiKey(SENDGRID_API_KEY);

// Get test email recipient from command line argument
const recipient = process.argv[2];
if (!recipient) {
  console.error('Error: Please provide recipient email as argument');
  console.error('Usage: node sendgrid-test-direct.js your@email.com');
  process.exit(1);
}

console.log('Sending test email to:', recipient);

// Create message with detailed debugging info
const msg = {
  to: recipient,
  from: SENDGRID_FROM_EMAIL,
  subject: 'Broadcom OTP Test Email - Debug',
  text: 'This is a test email to verify SendGrid integration is working correctly. Debug timestamp: ' + new Date().toISOString(),
  html: `
    <p>This is a test email to verify SendGrid integration is working correctly.</p>
    <p><strong>If you received this, the email functionality is working!</strong></p>
    <p>Debug information:</p>
    <ul>
      <li>Timestamp: ${new Date().toISOString()}</li>
      <li>Sender: ${SENDGRID_FROM_EMAIL}</li>
      <li>Recipient: ${recipient}</li>
      <li>Environment: Direct test (not through Netlify function)</li>
    </ul>
  `,
};

// Send email with detailed logging
sgMail.send(msg)
  .then((response) => {
    console.log('SUCCESS: Test email sent successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
  })
  .catch((error) => {
    console.error('ERROR: Failed to send test email:');
    console.error(error.toString());
    
    // If there are SendGrid-specific errors, log them
    if (error.response) {
      console.error('SendGrid Error Status:', error.response.statusCode);
      console.error('SendGrid Error Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('SendGrid Error Details:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }); 