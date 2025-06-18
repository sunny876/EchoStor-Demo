const axios = require('axios');

// Zoom API credentials - replace with environment variables in production
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff(fn, retries = 3, backoff = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Only retry on rate limit errors (429) or temporary server errors (5xx)
      if ((error.response && error.response.status === 429) || 
          (error.response && error.response.status >= 500)) {
        console.log(`API error. Retrying after ${backoff}ms... (Attempt ${i + 1}/${retries})`);
        lastError = error;
        
        // Wait longer between each retry (exponential backoff)
        await delay(backoff);
        backoff *= 2; // Double the backoff time for next attempt
      } else {
        // For other errors, don't retry
        throw error;
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError;
}

async function generateOauthAccountCredentials() {
  const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post('https://zoom.us/oauth/token', {
    grant_type: 'account_credentials',
    account_id: ZOOM_ACCOUNT_ID,
  }, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.status === 200) {
    return response;
  } else {
    throw new Error(`Failed to generate access token: ${response.statusText}`);
  }
}

async function generateOauthClientCredentials() {
  const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const response = await retryWithBackoff(
    () => axios.post('https://api.zoom.us/oauth/token?grant_type=client_credentials', {}, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
  );

  if (response.status === 200) {
    return response;
  } else {
    throw new Error(`Failed to generate access token: ${response.statusText}`);
  }
}


exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Starting Zoom OAuth token request');
    console.log('Using account ID:', ZOOM_ACCOUNT_ID);
    console.log('Client ID available:', !!ZOOM_CLIENT_ID);
    console.log('Client Secret available:', !!ZOOM_CLIENT_SECRET);

    const response = await generateOauthAccountCredentials();
    
    console.log('Token request successful');
    const { access_token, expires_in, token_type } = response.data;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For development - restrict this in production
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        access_token,
        expires_in,
        token_type
      })
    };
  } catch (error) {
    console.error('Error getting Zoom access token:', error.message);
    
    // Log more detailed error information
    if (error.response) {
      console.error('OAuth error response status:', error.response.status);
      console.error('OAuth error response data:', JSON.stringify(error.response.data));
    }
    
    if (error.request) {
      console.error('OAuth request was made but no response received');
    }
    
    console.error('OAuth error stack:', error.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get Zoom access token',
        details: error.response?.data || error.message
      })
    };
  }
}; 