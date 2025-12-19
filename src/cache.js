import NodeCache from "node-cache";

export class Cache extends NodeCache {
  constructor(options = {}) {
    const defaults = {
      stdTTL: 60,
      checkperiod: 120,
    };
    super({ ...defaults, ...options });

    this.namespaces = new Set();
    this.tagMap = new Map(); // tag -> Set of keys

    this.on("expired", (key, value) => {
      console.log(`[Cache] Key expired: ${key} ->`, value);
      this._removeKeyFromTags(key);
    });
  }

  _getKey(key, namespace) {
    return namespace ? `${namespace}:${key}` : key;
  }

  _removeKeyFromTags(key) {
    for (const [tag, keys] of this.tagMap.entries()) {
      if (keys.has(key)) {
        keys.delete(key);
        if (keys.size === 0) this.tagMap.delete(tag);
      }
    }
  }

  setItem(key, value, ttl, namespace, tags = []) {
    const fullKey = this._getKey(key, namespace);
    if (namespace) this.namespaces.add(namespace);

    const storedValue = typeof value === "string" ? value : JSON.stringify(value);
    this.set(fullKey, storedValue, ttl);

    // Assign tags
    for (const tag of tags) {
      if (!this.tagMap.has(tag)) this.tagMap.set(tag, new Set());
      this.tagMap.get(tag).add(fullKey);
    }
  }

  getItem(key, namespace) {
    const fullKey = this._getKey(key, namespace);
    const value = this.get(fullKey);
    if (value === undefined) return undefined;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async getOrSetItem(key, computeFn, ttl, namespace, tags = []) {
    let value = this.getItem(key, namespace);
    if (value === undefined) {
      value = await computeFn();
      this.setItem(key, value, ttl, namespace, tags);
    }
    return value;
  }

  deleteItem(key, namespace) {
    const fullKey = this._getKey(key, namespace);
    this._removeKeyFromTags(fullKey);
    return this.del(fullKey);
  }

  clearNamespace(namespace) {
    if (!namespace) {
      this.flushAll();
      this.tagMap.clear();
      console.log("[Cache] All keys cleared");
      return;
    }

    for (const key of this.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.deleteItem(key);
      }
    }
    console.log(`[Cache] Namespace "${namespace}" cleared`);
  }

  /**
   * Delete all keys associated with a tag
   * @param {string} tag
   */
  clearTag(tag) {
    if (!this.tagMap.has(tag)) return;

    for (const key of this.tagMap.get(tag)) {
      this.del(key);
    }
    this.tagMap.delete(tag);
    console.log(`[Cache] All keys with tag "${tag}" cleared`);
  }
}
