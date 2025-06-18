const axios = require('axios');

// Function to retrieve messages directly from Zoom API
exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Get channel ID from query parameters
    const { channelId, since } = event.queryStringParameters || {};
    
    if (!channelId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'channelId is required' })
      };
    }
    
    // First, get a Zoom OAuth token
    const tokenResponse = await axios.post('/.netlify/functions/zoom-oauth', {}, {
      baseURL: process.env.URL || 'http://localhost:8888',
    });
    
    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      throw new Error('Failed to get Zoom access token');
    }
    
    const accessToken = tokenResponse.data.access_token;
    
    // Prepare request to get messages from the channel
    const requestUrl = `https://api.zoom.us/v2/chat/channels/${channelId}/messages`;
    
    // Set up parameters for pagination and filtering
    const params = {};
    if (since) {
      // Convert since to a Unix timestamp in milliseconds if it's an ISO string
      try {
        const sinceDate = new Date(since);
        // Add 1ms to avoid duplicates
        params.from = sinceDate.getTime() + 1;
      } catch (err) {
        console.error('Error parsing since date:', err);
      }
    }
    
    // Get messages from Zoom API
    const messagesResponse = await axios.get(requestUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: params
    });
    
    if (!messagesResponse.data || !messagesResponse.data.messages) {
      throw new Error('Invalid response from Zoom API');
    }
    
    // Filter messages from app users (to avoid showing messages we sent)
    // This assumes your Zoom app has an email like syeduali007@gmail.com
    const appEmail = 'syeduali007@gmail.com'; // Replace with your app's email
    
    const filteredMessages = messagesResponse.data.messages.filter(msg => 
      msg.sender.email !== appEmail
    ).map(msg => ({
      channelId,
      message: msg.message,
      sender: msg.sender.email,
      timestamp: new Date(msg.date_time).toISOString(),
      agentName: msg.sender.first_name || 'Agent',
      senderName: `${msg.sender.first_name || ''} ${msg.sender.last_name || ''}`.trim() || 'Zoom Agent'
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        messages: filteredMessages
      })
    };
  } catch (error) {
    console.error('Error retrieving Zoom messages:', error);
    
    // Provide detailed error information for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null
    };
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error retrieving messages from Zoom', 
        details: errorDetails 
      })
    };
  }
}; 