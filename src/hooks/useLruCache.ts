import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_ELEMENTS = 10;

type Store = {
  keys: string[];
  cache: Map<string, string>;
  setCache: (key: string, value: string) => void;
  getCache: (key: string) => string | undefined;
};

const useCacheInternal = create(
  persist<Store>(
    (set) => ({
      cache: new Map(),
      keys: [],
      setCache: (key, value) => {
        set((store) => {
          let { cache, keys } = store;
          cache.set(key, value);
          keys = keys.filter((k) => k !== key);
          keys.push(key);
          if (keys.length > MAX_ELEMENTS) {
            keys = keys.slice(1);
          }
          return { keys, cache };
        });
      },
      getCache: (key) => {
        let value = undefined;
        set((store) => {
          let { cache, keys } = store;
          value = cache.get(key);
          keys = keys.filter((k) => k !== key);
          keys.push(key);
          if (keys.length > MAX_ELEMENTS) {
            keys = keys.slice(1);
          }
          return { keys };
        });
        return value;
      },
    }),
    {
      name: "lru-cache",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default function useLruCache() {
  const { setCache, getCache } = useCacheInternal();
  return { get: getCache, set: setCache };
}
