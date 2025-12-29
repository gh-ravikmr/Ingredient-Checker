// utils/cache.js - Caching Utilities
import NodeCache from "node-cache";
import crypto from "crypto";
import { CACHE_CONFIG } from "../configuration/constants.js";

export class CacheManager {
  constructor() {
    this.cache = new NodeCache(CACHE_CONFIG);
  }

  generateKey(data) {
    return crypto.createHash("md5").update(data.toLowerCase()).digest("hex");
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  del(key) {
    this.cache.del(key);
  }

  flush() {
    this.cache.flushAll();
  }

  close() {
    this.cache.close();
  }

  getStats() {
    return this.cache.getStats();
  }
}

export default new CacheManager();
