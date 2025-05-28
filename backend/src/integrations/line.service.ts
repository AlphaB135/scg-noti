import { Client } from '@line/bot-sdk'
import { sendLineNotification } from '../line-notifier'

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
}

// Initialize LINE client - kept for backward compatibility
const client = new Client(config)

/**
 * ส่งข้อความแจ้งเตือนผ่าน LINE OA
 * @param lineToken LINE user ID ของผู้รับ
 * @param message ข้อความที่ต้องการส่ง
 * @returns Promise<any>
 */
export async function pushMessage(lineToken: string, message: string): Promise<any> {
  return sendLineNotification(lineToken, message);
}

/**
 * ส่งข้อความแจ้งเตือนพร้อม retry กรณีล้มเหลว
 */
export async function pushMessageWithRetry(
  lineToken: string,
  message: string,
  maxRetries: number = 1
): Promise<any> {
  return sendLineNotification(lineToken, message, maxRetries);
}
