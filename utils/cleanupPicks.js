import AsyncStorage from '@react-native-async-storage/async-storage';

const PICK_PREFIX = 'pick_';
const MAX_AGE_DAYS = 30;

export async function cleanupOldPicks() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const pickKeys = allKeys.filter(key => key.startsWith(PICK_PREFIX));
    
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const keysToDelete = [];

    for (const key of pickKeys) {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Delete if older than MAX_AGE_DAYS or if it's old format (no timestamp)
          if (!parsed.timestamp || (now - parsed.timestamp) > maxAge) {
            keysToDelete.push(key);
          }
        }
      } catch {
        // Invalid data, mark for deletion
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      await AsyncStorage.multiRemove(keysToDelete);
      console.log(`Cleaned up ${keysToDelete.length} old picks`);
    }
  } catch (e) {
    console.error("Error cleaning up picks", e);
  }
}
