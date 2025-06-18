import sgMail from '@sendgrid/mail';

// Lambda function handler
export const handler = async function(event, context) {
  console.log('[SEND-OTP] BEGIN EXECUTION');
  console.log('[SEND-OTP] Event:', JSON.stringify(event));

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('[SEND-OTP] Rejected non-POST request');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = process.env;
  
  // Log environment variables (mask key partially for safety)
  console.log('[SEND-OTP] SENDGRID_API_KEY loaded:', SENDGRID_API_KEY ? `***${SENDGRID_API_KEY.slice(-4)}` : 'Not Found');
  console.log('[SEND-OTP] SENDGRID_FROM_EMAIL loaded:', SENDGRID_FROM_EMAIL || 'Not Found');

  // Check for API key
  if (!SENDGRID_API_KEY) {
      console.error('[SEND-OTP] SendGrid API Key check failed.');
      return { statusCode: 500, body: 'Configuration error: SendGrid API Key missing.' };
  }
  
  // Set API key with error handling
  try {
      console.log('[SEND-OTP] Setting SendGrid API Key...');
      sgMail.setApiKey(SENDGRID_API_KEY);
      console.log('[SEND-OTP] SendGrid API Key set.');
  } catch (apiKeyError) {
      console.error('[SEND-OTP] Error setting SendGrid API key:', apiKeyError);
      return { statusCode: 500, body: 'Configuration error: Failed to set API key.' };
  }

  // Check for sender email
  if (!SENDGRID_FROM_EMAIL) {
      console.error('[SEND-OTP] SendGrid From Email check failed.');
      return { statusCode: 500, body: 'Configuration error: SendGrid From Email missing.' };
  }

  // Process request
  try {
    console.log('[SEND-OTP] Parsing request body...');
    console.log('[SEND-OTP] Request body:', event.body);
    const { email, otp } = JSON.parse(event.body);
    console.log(`[SEND-OTP] Parsed data - Email: ${email}, OTP: ${otp}`);

    if (!email || !otp) {
      console.log('[SEND-OTP] Missing email or OTP in body.');
      return { statusCode: 400, body: 'Missing email or otp in request body' };
    }

    // Optimized email message with better deliverability for email providers
    const msg = {
      to: email,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'EchoStor Support'
      },
      subject: 'IMPORTANT: Your EchoStor Support Verification Code - ' + otp,
      text: `Your verification code for EchoStor Support is: ${otp}

This code will expire in 5 minutes.

If you did not request this code, please ignore this email.

----------
EchoStor Support Team
Do not reply to this email - it was sent from an unmonitored account.
Email sent: ${new Date().toISOString()}
`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="background-color: #A91E22; padding: 20px; text-align: center; color: white; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EchoStor Support</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Please use the following code to verify your identity:
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
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      // Optimize mail settings to avoid processing queue
      mail_settings: {
        bypass_list_management: {
          enable: true
        },
        sandbox_mode: {
          enable: false
        }
      },
      // Disable tracking to improve deliverability
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
      // Add priority categories
      categories: ['verification', 'transactional']
    };

    console.log('[SEND-OTP] Email message prepared');
    console.log('[SEND-OTP] Attempting to send email via SendGrid...');
    
    // Return a promise wrapping the email sending
    try {
      const response = await sgMail.send(msg);
      console.log(`[SEND-OTP] ✅ SendGrid API response:`, JSON.stringify(response));
      console.log(`[SEND-OTP] ✅ OTP email sent successfully to ${email}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'OTP email sent successfully',
          details: 'Please check your inbox or spam folder'
        })
      };
    } catch (error) {
      console.error('[SEND-OTP] ❌ Error sending OTP email:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('[SEND-OTP] ❌ SendGrid Response Status:', error.response.status);
        console.error('[SEND-OTP] ❌ SendGrid Response Headers:', JSON.stringify(error.response.headers));
        console.error('[SEND-OTP] ❌ SendGrid Response Body:', JSON.stringify(error.response.body));
      }
      
      return {
        statusCode: error.response ? error.response.statusCode : 500,
        body: JSON.stringify({ 
          error: 'Failed to send OTP email', 
          details: error.message,
          response: error.response ? JSON.stringify(error.response.body) : 'No response details' 
        })
      };
    }

  } catch (error) {
    console.error('[SEND-OTP] ❌ General error in function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
} 