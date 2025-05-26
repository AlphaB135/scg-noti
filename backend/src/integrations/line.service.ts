import { Client } from '@line/bot-sdk'

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

// Initialize LINE client
const client = new Client(config)

/**
 * ส่งข้อความแจ้งเตือนผ่าน LINE OA
 * @param lineToken LINE user ID ของผู้รับ
 * @param message ข้อความที่ต้องการส่ง
 * @returns Promise<any>
 */
export async function pushMessage(lineToken: string, message: string): Promise<any> {
  if (!lineToken) {
    throw new Error('LINE token is required')
  }

  try {
    return await client.pushMessage(lineToken, {
      type: 'text',
      text: message
    })
  } catch (error) {
    console.error('LINE push message failed:', error)
    throw error // Re-throw for handling by caller
  }
}

/**
 * ส่งข้อความแจ้งเตือนพร้อม retry กรณีล้มเหลว
 */
export async function pushMessageWithRetry(
  lineToken: string,
  message: string,
  maxRetries: number = 1
): Promise<any> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await pushMessage(lineToken, message)
    } catch (error) {
      if (attempt === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before retry
    }
  }
}
