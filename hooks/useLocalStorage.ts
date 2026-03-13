/**
 * useLocalStorage - Helper hook for localStorage access
 */

/**
 * Get item from localStorage (client-side only)
 */
export function storageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Set item in localStorage (client-side only)
 */
export function storageSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn(`Failed to set localStorage key: ${key}`);
  }
}

/**
 * Remove item from localStorage
 */
export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Failed to remove localStorage key: ${key}`);
  }
}

/**
 * Clear all RPG-related items from localStorage
 */
export function storageClear(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = [
      'rpg-player',
      'rpg-seed',
      'rpg-messages',
      'rpg-narrative',
      'rpg-log',
      'rpg-auth-token',
      'rpg-auth-email',
    ];
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    console.warn('Failed to clear localStorage');
  }
}

/**
 * Parse JSON from localStorage with fallback
 */
export function storageGetJson<T>(key: string, fallback: T): T {
  const str = storageGet(key);
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Store JSON in localStorage
 */
export function storageSetJson<T>(key: string, value: T): void {
  try {
    storageSet(key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to store JSON in localStorage: ${key}`);
  }
}
