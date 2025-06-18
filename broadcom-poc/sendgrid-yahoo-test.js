// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import SendGrid mail package
import sgMail from '@sendgrid/mail';

console.log('Starting SendGrid Yahoo Mail test...');

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
  console.error('Usage: node sendgrid-yahoo-test.js your@yahoo.com');
  process.exit(1);
}

// Generate a random OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();

console.log('Sending test email to:', recipient);
console.log('Using OTP:', otp);

// Create a Yahoo-optimized message
const msg = {
  to: recipient,
  from: {
    email: SENDGRID_FROM_EMAIL,
    name: 'Broadcom Support Team'
  },
  subject: 'IMPORTANT: Your Broadcom Support Verification Code - ' + otp,
  text: `Your verification code for Broadcom Support is: ${otp}

This code will expire in 5 minutes.

If you did not request this code, please ignore this email.

----------
Broadcom Support Team
Do not reply to this email - it was sent from an unmonitored account.
Email sent via Broadcom Customer Support System at ${new Date().toISOString()}
`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="background-color: #A91E22; padding: 20px; text-align: center; color: white; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Broadcom Support Team</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">
          Please use the following code to verify your identity with Broadcom Support:
        </p>
        <div style="background-color: #f7f7f7; padding: 20px; text-align: center; margin: 25px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #A91E22; border-radius: 4px;">
          ${otp}
        </div>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">
          This code will expire in <strong>5 minutes</strong>.
        </p>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">
          If you did not request this code, please ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message. Please do not reply to this email as it was sent from an unmonitored account.
        </p>
        <p style="color: #999; font-size: 12px; text-align: center;">
          Email sent via Broadcom Customer Support System at ${new Date().toISOString()}
        </p>
      </div>
    </div>
  `,
  mail_settings: {
    bypass_list_management: {
      enable: true
    }
  },
  tracking_settings: {
    click_tracking: {
      enable: false
    },
    open_tracking: {
      enable: false
    },
    subscription_tracking: {
      enable: false
    }
  },
  categories: ['verification', 'critical']
};

// Send email with detailed logging
sgMail.send(msg)
  .then((response) => {
    console.log('SUCCESS: Yahoo test email sent successfully!');
    console.log('Response Status Code:', response[0].statusCode);
    console.log('Message ID:', response[0].headers['x-message-id'] || 'Not available');
    console.log('\nPlease check both your inbox AND spam folder in Yahoo Mail.');
    console.log('If you still don\'t receive the email, try adding noreply@broadcom.com to your contact list in Yahoo Mail, then try again.');
  })
  .catch((error) => {
    console.error('ERROR: Failed to send test email:');
    console.error(error.toString());
    
    // If there are SendGrid-specific errors, log them
    if (error.response) {
      console.error('SendGrid Error Status:', error.response.statusCode);
      console.error('SendGrid Error Details:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }); 