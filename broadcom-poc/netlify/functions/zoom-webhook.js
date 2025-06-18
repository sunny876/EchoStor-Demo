const axios = require('axios');

// This function will receive webhook events from Zoom
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the webhook payload from Zoom
    const payload = JSON.parse(event.body);
    console.log('Received Zoom webhook:', JSON.stringify(payload).substring(0, 200) + '...');
    
    // Verify this is a chat message event
    if (payload.event !== 'chat.message_created') {
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, message: 'Event ignored - not a chat message' })
      };
    }
    
    // Extract the channel ID, message content, and sender info
    const channelId = payload.payload.channel_id;
    const messageContent = payload.payload.message;
    const senderEmail = payload.payload.sender.email;
    
    // Don't process messages from the app itself (to avoid loops)
    if (senderEmail === 'syeduali007@gmail.com') {
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, message: 'Message from self ignored' })
      };
    }
    
    // Store the message in the "database" (we'll use a flat file in /tmp for this demo)
    // In production, use a real database
    const fs = require('fs');
    const dbPath = '/tmp/zoom_messages.json';
    
    let messages = [];
    try {
      // Try to read existing messages
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        messages = JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading messages from file:', err);
    }
    
    // Add the new message
    messages.push({
      channelId,
      message: messageContent,
      sender: senderEmail,
      timestamp: new Date().toISOString(),
      agentName: 'Tracey',  // In production, get the actual agent name
      read: false
    });
    
    // Save messages back to file
    fs.writeFileSync(dbPath, JSON.stringify(messages));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        received: true,
        message: 'Message stored successfully'
      })
    };
  } catch (error) {
    console.error('Zoom webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
}; 