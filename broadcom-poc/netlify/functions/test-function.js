// Lambda function handler
export const handler = async function(event, context) {
  // Using a more explicit console logging method
  console.log('[TEST-FUNCTION] BEGIN EXECUTION');
  console.log('[TEST-FUNCTION] Request method:', event.httpMethod);
  console.log('[TEST-FUNCTION] Request path:', event.path);
  
  // Return a direct response
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Test function executed successfully',
      time: new Date().toISOString() 
    })
  };
} 