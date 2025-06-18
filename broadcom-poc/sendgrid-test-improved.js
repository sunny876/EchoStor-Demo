// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import SendGrid mail package
import sgMail from '@sendgrid/mail';

console.log('Starting SendGrid improved test...');

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
  console.error('Usage: node sendgrid-test-improved.js your@email.com');
  process.exit(1);
}

// Generate a random OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();

console.log('Sending test email to:', recipient);
console.log('Using OTP:', otp);

// Improved email message with better deliverability
const msg = {
  to: recipient,
  from: {
    email: SENDGRID_FROM_EMAIL,
    name: 'Broadcom Support'
  },
  subject: 'Your Broadcom Verification Code: ' + otp,
  text: `Your one-time password for Broadcom support is: ${otp}. This code will expire in 5 minutes. If you did not request this code, please ignore this email.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #A91E22; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Broadcom Support</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>Your Verification Code</h2>
        <p style="font-size: 16px;">Use the following code to verify your email address:</p>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `,
  tracking_settings: {
    click_tracking: {
      enable: true
    },
    open_tracking: {
      enable: true
    }
  }
};

// Send email with detailed logging
sgMail.send(msg)
  .then((response) => {
    console.log('SUCCESS: Test email sent successfully!');
    console.log('Response Status Code:', response[0].statusCode);
    console.log('Response Headers:', JSON.stringify(response[0].headers, null, 2));
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