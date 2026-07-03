export function createStorageItem<T>(key: string) {
  return {
    get(): T | null {
      const val = localStorage.getItem(key);
      if (!val) return null;
      try {
        return JSON.parse(val) as T;
      } catch {
        return val as unknown as T;
      }
    },
    set(val: T): void {
      localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
    },
    remove(): void {
      localStorage.removeItem(key);
    }
  };
}
