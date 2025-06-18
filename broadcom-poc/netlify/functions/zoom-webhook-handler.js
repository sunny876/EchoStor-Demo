const crypto = require('crypto');

exports.handler = async function(event, context) {
  // 1. Check if it's a POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 2. Get the Verification Token from environment variables
  //    (You MUST set this in your Netlify environment)
  const zoomVerificationToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
  if (!zoomVerificationToken) {
    console.error('Error: ZOOM_WEBHOOK_SECRET_TOKEN is not set.');
    return { statusCode: 500, body: 'Internal Server Error: Missing configuration.' };
  }

  // 3. Check if this is a Zoom Validation Request
  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (e) {
    console.error('Error parsing request body:', e);
    return { statusCode: 400, body: 'Bad Request: Invalid JSON.' };
  }

  // Check for the presence of payload.plainToken, indicating a validation request
  if (requestBody.event === 'endpoint.url_validation' && requestBody.payload && requestBody.payload.plainToken) {
    console.log('Received Zoom URL validation request.');
    const plainToken = requestBody.payload.plainToken;

    // 4. Create the HMAC SHA256 hash
    const hashForValidate = crypto.createHmac('sha256', zoomVerificationToken)
      .update(plainToken)
      .digest('hex');

    // 5. Construct the response JSON
    const responseJson = {
      plainToken: plainToken,
      encryptedToken: hashForValidate
    };

    console.log('Responding to Zoom validation.');
    // 6. Send the 200 OK response with the JSON payload
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseJson)
    };
  } else {
    // --- This is where you'll handle ACTUAL event notifications later ---
    console.log('Received a regular Zoom event (or unknown request):', requestBody.event);
    // TODO: Add logic to verify actual event notifications using the 'authorization' header
    //       and process the event data (e.g., new chat message)

    // For now, just acknowledge receipt of other events
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Event received, processing not yet implemented.' })
    };
  }
}; 