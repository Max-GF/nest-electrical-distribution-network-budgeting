import { CacheRepository } from "src/infra/cache/cache-repository";

interface CacheItem {
  value: string;
  expiresAt: Date;
}
export class FakeCacheRepository implements CacheRepository {
  public items = new Map<string, CacheItem>();

  async set(key: string, value: string, lifetimeInMs?: number): Promise<void> {
    this.items.set(key, {
      value,
      expiresAt: new Date(Date.now() + (lifetimeInMs ?? 1000 * 60 * 15)), // 15 minutes if not specified
    });
  }
  async get(key: string): Promise<string | null> {
    const item = this.items.get(key);
    if (!item) {
      return null;
    }
    const now = new Date();
    if (now > item.expiresAt) {
      this.items.delete(key);
      return null;
    }
    return item.value;
  }
  async delete(key: string): Promise<void> {
    const regexPattern = new RegExp(
      "^" +
        key
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, ".*")
          .replace(/\?/g, ".") +
        "$",
    );

    for (const k of this.items.keys()) {
      if (regexPattern.test(k)) {
        this.items.delete(k);
      }
    }
  }
}
