const STORAGE_PREFIX = 'beauty_salon_';

export const storage = {
  get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};
