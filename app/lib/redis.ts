class MemoryCache {
  private cache = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.cache.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => {
        this.cache.delete(key);
      }, duration * 1000);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.cache.delete(key);
    return deleted ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const val = this.cache.get(key);
    const num = val ? parseInt(val, 10) : 0;
    const next = num + 1;
    this.cache.set(key, next.toString());
    return next;
  }

  async expire(key: string, seconds: number): Promise<number> {
    setTimeout(() => {
      this.cache.delete(key);
    }, seconds * 1000);
    return 1;
  }
}

interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | string>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

const redisClient: ICache = new MemoryCache();

export default redisClient;
