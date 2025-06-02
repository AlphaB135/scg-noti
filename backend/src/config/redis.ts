import { LRUCache } from 'lru-cache'

// ถ้าไม่มี Redis ให้ใช้ In-memory cache แทน
const inMemoryCache = new LRUCache({
  max: 500, // จำนวน items สูงสุด
  ttl: 1000 * 60 * 15 // default TTL 15 นาที
})

// Cache interface เดียวกับ Redis
export const cache = {
  async getOrFetch(key: string, fetchFn: () => Promise<any>, ttl?: number): Promise<any> {
    const cached = inMemoryCache.get(key)
    if (cached) return cached
    
    const fresh = await fetchFn()
    inMemoryCache.set(key, fresh)
    return fresh
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    inMemoryCache.set(key, value, { ttl })
  },

  async get(key: string): Promise<any> {
    return inMemoryCache.get(key)
  },
  
  async del(key: string): Promise<void> {
    inMemoryCache.delete(key)
  },

  async invalidateByPrefix(prefix: string): Promise<void> {
    for (const key of inMemoryCache.keys()) {
      if (key.toString().startsWith(prefix)) {
        inMemoryCache.delete(key)
      }
    }
  }
}
