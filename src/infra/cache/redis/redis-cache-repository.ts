import { Injectable } from "@nestjs/common";
import { CacheRepository } from "../cache-repository";
import { RedisService } from "./redis.service";

@Injectable()
export class RedisCacheRepository implements CacheRepository {
  constructor(private redis: RedisService) {}
  async set(key: string, value: string, lifetimeInMs?: number): Promise<void> {
    await this.redis.set(key, value, "PX", lifetimeInMs ?? 1000 * 60 * 15); // 15 minutes if not specified
  }
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
  async delete(key: string): Promise<void> {
    const keys = await this.redis.keys(key);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
