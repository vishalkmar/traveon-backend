const store = new Map();

const isFresh = (entry) => entry && entry.expiresAt > Date.now();

export const getCachedValue = (key) => {
  const entry = store.get(key);
  if (!isFresh(entry)) {
    if (entry) {
      store.delete(key);
    }
    return null;
  }
  return entry.value;
};

export const setCachedValue = (key, value, ttlMs) => {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export const clearCachedValue = (prefix) => {
  for (const key of store.keys()) {
    if (!prefix || key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};
