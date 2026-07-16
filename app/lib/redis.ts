import Redis from 'ioredis';
import { env } from './env';

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

class RedisCache implements ICache {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
    });
    
    this.client.on('error', (err) => {
      console.error('[REDIS] Connection error:', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | string> {
    if (mode === 'EX' && duration) {
      return this.client.set(key, value, 'EX', duration);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
}

const redisClient: ICache = env.REDIS_URL 
  ? new RedisCache(env.REDIS_URL) 
  : new MemoryCache();

export default redisClient;
