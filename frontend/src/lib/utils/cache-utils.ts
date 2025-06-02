// cache-utils.ts
// Simple cache utility for API responses

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + (ttlMinutes * 60 * 1000)
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(keyPattern?: string): void {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }
    
    // Remove keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Get cache stats for debugging
  getStats() {
    const now = Date.now();
    const total = this.cache.size;
    let valid = 0;
    let expired = 0;
    
    for (const entry of this.cache.values()) {
      if (now <= entry.expiry) {
        valid++;
      } else {
        expired++;
      }
    }
    
    return { total, valid, expired };
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache keys for consistent naming
export const CACHE_KEYS = {
  TEAMS: 'teams',
  TEAM_STATS: (teamId: string) => `team-stats-${teamId}`,
  MEMBER_STATS: (memberId: string) => `member-stats-${memberId}`,
  BULK_MEMBER_STATS: (memberIds: string[]) => `bulk-member-stats-${memberIds.sort().join('-')}`,
} as const;
