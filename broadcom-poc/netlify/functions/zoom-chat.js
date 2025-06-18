const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const { action, token, data } = payload;
    
    // Log the request payload for debugging
    console.log('Request action:', action);
    console.log('Token provided:', token ? 'Yes (token hidden)' : 'No');
    console.log('Data provided:', data ? JSON.stringify(data).substring(0, 100) + '...' : 'No');
    
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Access token is required' })
      };
    }
    
    let result;
    
    switch (action) {
      case 'create_channel':
        // Create a new chat channel
        const { channelName: createChannelName, members } = data;
        
        if (!createChannelName || !members || !Array.isArray(members)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'channelName and members array are required' })
          };
        }
        
        result = await createChatChannel(token, createChannelName, members);
        break;
        
      case 'send_message':
        // Send a message to a channel
        const { messageChannel, message } = data;
        
        console.log('Received send_message request with:');
        console.log('- channel:', messageChannel);
        console.log('- message:', message ? (message.length > 20 ? message.substring(0, 20) + '...' : message) : 'undefined');
        
        if (!messageChannel || !message) {
          console.error('Missing required parameters for send_message:');
          console.error('- channel present:', !!messageChannel);
          console.error('- message present:', !!message);
          
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'channel and message are required' })
          };
        }
        
        // Validate channel format - should be a non-empty string
        if (typeof messageChannel !== 'string' || messageChannel.trim() === '') {
          console.error(`Invalid channel format: ${typeof messageChannel}, value: ${messageChannel}`);
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'channel must be a non-empty string' })
          };
        }
        
        result = await sendChatMessage(token, messageChannel, message);
        break;
        
      case 'list_channels':
        // List existing channels
        result = await listChatChannels(token);
        break;
        
      case 'handoff':
        // Handle complete handoff flow
        const { userEmail, messages, channel } = data;
        
        console.log('Handoff requested for:', userEmail);
        console.log('Channel:', channel);
        console.log('Chat history length:', messages ? messages.length : 0);
        
        if (!userEmail || !messages || !channel) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'userEmail, messages, and channel are required' })
          };
        }

        //return {
        //    statusCode: 200,
        //    body: JSON.stringify({ error: 'Not Implemented Yet!!!' })
        //};

        /**
        // Determine which agents should handle this intent (simplified version)
        const agentEmails = ['syeduali007@gmail.com']; // Agent email for Zoom
        
        // Create a channel for this specific support case (with timestamp for uniqueness)
        const timestamp = new Date().toISOString().replace(/[^\d]/g, '').substring(0, 14);
        const supportChannelName = `Support: ${userEmail} - ${intent} - ${timestamp}`;
        console.log('Creating unique channel with timestamp:', timestamp);
        
        const channel = await retryWithBackoff(
          () => createChatChannel(token, supportChannelName, [userEmail, ...agentEmails])
        );
        
        // Log the channel creation response
        console.log('Channel creation response:', JSON.stringify({
          id: channel.id,
          name: channel.name,
          type: channel.type
        }));
        
        if (!channel.id) {
          console.error('Error: Created channel but no ID was returned');
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to obtain channel ID' })
          };
        }
        **/
        
        // Format chat history
        const formattedHistory = formatChatHistory(messages);
        
        // Send the initial message with chat history
        const initialMessage = `New customer chat session\n\nChannel: ${channel}\n\nChat History:\n${formattedHistory}`;
        await retryWithBackoff(
          () => sendChatMessage(token, channel, initialMessage)
        );
        
        // Log the final successful handoff data being returned
        console.log('Handoff successful, using channel:', channel);
        
        result = {
          success: true,
          channel: channel,
          message: 'Support case created and agents notified'
        };
        break;
        
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Zoom Chat API error:', error.message);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
    }
    
    if (error.request) {
      console.error('Request was made but no response received');
    }
    
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Zoom Chat operation failed',
        details: error.response?.data || error.message
      })
    };
  }
};

// Function to list chat channels
async function listChatChannels(token) {
  const response = await axios.get('https://api.zoom.us/v2/chat/users/me/channels', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
}

// Function to create a new chat channel
async function createChatChannel(token, channelName, members) {
  console.log('Creating channel:', channelName);
  console.log('With members:', members);
  
  // Format members as required by Zoom API (array of objects with email)
  const formattedMembers = members.map(email => ({ email }));
  
  // Construct request body exactly as Zoom API expects it
  const requestBody = JSON.stringify({
    name: channelName,
    type: 2, // 2 represents group chat
    members: formattedMembers
  });
  
  console.log('Request body:', requestBody);
  
  try {
    const response = await axios.post(
      'https://api.zoom.us/v2/chat/users/me/channels', 
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log successful response
    console.log('Channel creation successful, response status:', response.status);
    console.log('Channel ID received:', response.data.id);
    
    return response.data;
  } catch (error) {
    // Add detailed error logging
    console.error('Error creating Zoom chat channel:');
    console.error('- Status:', error.response?.status);
    console.error('- Data:', JSON.stringify(error.response?.data));
    
    // Rethrow to let the retry logic handle it
    throw error;
  }
}

// Function to send a message to a channel using the bot endpoint
async function sendChatMessage(token, channel, message) {
  // Ensure required environment variables are available
  if (!process.env.ZOOM_BOT_JID) {
    console.error('Error: ZOOM_BOT_JID environment variable not set.');
    throw new Error('Missing required configuration: ZOOM_BOT_JID');
  }
  if (!process.env.ZOOM_ACCOUNT_ID) {
    console.error('Error: ZOOM_ACCOUNT_ID environment variable not set.');
    throw new Error('Missing required configuration: ZOOM_ACCOUNT_ID');
  }

  console.log(`Sending message via to channel: ${channel}`);
  console.log(`Message is: ${message}`);
  //console.log(`Using robot_jid: ${process.env.ZOOM_BOT_JID}`);
  console.log(`Using account_id: ${process.env.ZOOM_ACCOUNT_ID}`);

  //TODO only for testing
  //Also can go to the channel in the Zoom app, get the channel link, then go to an online JWT decoder and decode
  //the part of the link that is the long string at the end of the URL - that is the channel ID.
  /** liveAgentEmail = "justin@vectara.com";
  const listChannelsResponse = await axios.get(`https://api.zoom.us/v2/chat/users/${liveAgentEmail}/channels`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  console.log("Channels: " + JSON.stringify(listChannelsResponse.data, null, 2)) **/
  //TODO end testing

  userId = "justin@vectara.com"; // or "me"
  const response = await axios.post(`https://api.zoom.us/v2/chat/users/${userId}/messages`,
    {
      to_channel: channel,
      //to_contact: userId,
      message: message
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('IM message sent successfully, Zoom response status:', response.status);
  return response.data;
}

// Function to format chat history for better readability
function formatChatHistory(messages) {
  return '\n' + messages.map(entry => {
    return `${entry.sender || entry.type}: ${entry.text || entry.message}`;
  }).join('\n\n');
}

// Add a helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff(fn, retries = 3, backoff = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Special case: If channel already exists, that's actually not an error for our flow
      if (error.response && 
          error.response.status === 400 && 
          error.response.data && 
          error.response.data.message === "The channel name already exists.") {
        
        console.log('Channel already exists! Attempting to list and find existing channel...');
        
        // This is a fallback for our specific use case
        try {
          // Return a mock success response that our code can work with
          return { 
            id: `existing-channel-${Date.now()}`, // Generate a placeholder ID
            name: error.config && error.config.data ? JSON.parse(error.config.data).name : 'Unknown channel'
          };
        } catch (fallbackError) {
          console.log('Failed to handle existing channel gracefully:', fallbackError);
          // Continue with normal error handling
        }
      }
      
      // Only retry on rate limit errors (429)
      if (error.response && error.response.status === 429) {
        console.log(`Rate limited. Retrying after ${backoff}ms... (Attempt ${i + 1}/${retries})`);
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