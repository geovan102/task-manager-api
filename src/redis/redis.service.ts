import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client = new Redis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys: string[]) {
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async delByPrefix(prefix: string) {
    const keys: string[] = [];
    const stream = this.client.scanStream({ match: `${prefix}`, count: 100 });
    for await (const batch of stream) {
      keys.push(...(batch as string[]));
    }
    await this.del(...keys);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    await this.client.set(key, 0, 'EX', ttlSeconds, 'NX');
    return this.client.incr(key);
  }
}
