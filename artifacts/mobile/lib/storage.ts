import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  NOTES: "@lifevault_notes",
  TODOS: "@lifevault_todos",
  SHOPPING: "@lifevault_shopping",
  BIRTHDAYS: "@lifevault_birthdays",
  INFO: "@lifevault_info",
  BOOKMARKS: "@lifevault_bookmarks",
  SETTINGS: "@lifevault_settings",
} as const;

export async function loadData<T>(
  key: (typeof KEYS)[keyof typeof KEYS],
  fallback: T
): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveData<T>(
  key: (typeof KEYS)[keyof typeof KEYS],
  data: T
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage save error:", e);
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export async function exportAllData(): Promise<string> {
  const entries = await AsyncStorage.multiGet(Object.values(KEYS));
  const result: Record<string, unknown> = {};
  for (const [k, v] of entries) {
    if (v) result[k] = JSON.parse(v);
  }
  return JSON.stringify(result, null, 2);
}

export async function importAllData(json: string): Promise<boolean> {
  try {
    const data = JSON.parse(json);
    const pairs: [string, string][] = [];
    for (const [k, v] of Object.entries(data)) {
      if (Object.values(KEYS).includes(k as (typeof KEYS)[keyof typeof KEYS])) {
        pairs.push([k, JSON.stringify(v)]);
      }
    }
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch {
    return false;
  }
}
