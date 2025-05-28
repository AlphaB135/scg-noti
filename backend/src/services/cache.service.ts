import { cache } from '../config/redis'

/**
 * เซอร์วิสจัดการกลยุทธ์การล้างแคช
 */
export class CacheService {
  /**
   * ล้างแคชภาพรวมแดชบอร์ด
   */
  static async invalidateOverview(): Promise<void> {
    await cache.del('dashboard:overview')
  }

  /**
   * ล้างแคชข้อมูลสถิติแดชบอร์ดสำหรับทุกช่วงเวลา
   */
  static async invalidateMetrics(): Promise<void> {
    const commonDays = [7, 30, 90] // ช่วงวันที่ใช้บ่อย
    await Promise.all(
      commonDays.map(days => 
        cache.del(`dashboard:metrics:${days}`)
      )
    )
  }

  /**
   * ล้างแคชแดชบอร์ดเมื่อข้อมูลการแจ้งเตือนมีการเปลี่ยนแปลง
   */
  static async invalidateNotificationCaches(): Promise<void> {
    await Promise.all([
      CacheService.invalidateOverview(),
      CacheService.invalidateMetrics()
    ])
  }

  /**
   * ล้างแคชแดชบอร์ดเมื่อข้อมูลการอนุมัติมีการเปลี่ยนแปลง
   */
  static async invalidateApprovalCaches(): Promise<void> {
    await Promise.all([
      CacheService.invalidateOverview(),
      CacheService.invalidateMetrics()
    ])
  }

  /**
   * ล้างแคชแดชบอร์ดเมื่อข้อมูลผู้ใช้มีการเปลี่ยนแปลง
   */
  static async invalidateUserCaches(): Promise<void> {
    await CacheService.invalidateOverview()
  }

  /**
   * ล้างแคชแดชบอร์ดทั้งหมด
   */
  static async invalidateAllDashboardCaches(): Promise<void> {
    await Promise.all([
      CacheService.invalidateOverview(),
      CacheService.invalidateMetrics()
    ])
  }

  /**
   * ดึงข้อมูลรายการพนักงานจากแคช
   */
  static async getEmployeeList(key: string): Promise<any> {
    return cache.get(key)
  }

  /**
   * บันทึกข้อมูลรายการพนักงานลงแคช
   */
  static async setEmployeeList(key: string, value: any, ttl: number = 300): Promise<void> {
    await cache.set(key, value, ttl)
  }

  /**
   * ล้างแคชข้อมูลพนักงานทั้งหมด
   * เรียกเมื่อมีการเปลี่ยนแปลงข้อมูลพนักงาน
   */
  static async invalidateEmployeeCaches(): Promise<void> {
    await cache.invalidateByPrefix('employees:');
  }

  /**
   * Invalidate all keys matching a prefix
   */
  static async invalidateByPrefix(prefix: string): Promise<void> {
    await cache.invalidateByPrefix(prefix);
  }

  /**
   * Generic method to get data from cache
   */
  static async get(key: string): Promise<any> {
    return cache.get(key);
  }

  /**
   * Generic method to set data in cache
   */
  static async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await cache.set(key, value, ttl);
  }
}
