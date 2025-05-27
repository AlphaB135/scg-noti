import { Client } from '@line/bot-sdk';

if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
  console.warn('LINE credentials not set. LINE notifications will not be sent.');
}

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

// Initialize LINE client
const client = new Client(config);

/**
 * Sends a LINE notification to a recipient with feature flag control.
 * If ENABLE_LINE env var is 'true', sends real LINE message.
 * Otherwise acts as a stub that does nothing.
 * 
 * @param lineToken - LINE user/group ID to send to
 * @param message - Text message to send
 * @param maxRetries - Maximum number of retries for failed messages (optional)
 * @returns Promise that resolves when message is sent or void if disabled
 */
export async function sendLineNotification(
  lineToken: string,
  message: string,
  maxRetries: number = 1
): Promise<any> {
  if (!process.env.ENABLE_LINE || process.env.ENABLE_LINE !== 'true') {
    // LINE notifications disabled - return silently
    return;
  }

  if (!lineToken) {
    throw new Error('LINE token is required');
  }

  // Retry logic for failed messages
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.pushMessage(lineToken, {
        type: 'text',
        text: message
      });
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
}
