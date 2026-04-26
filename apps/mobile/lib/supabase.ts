import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * SecureStore-basierter Storage Adapter für Supabase Sessions.
 * Expo SecureStore unterstützt max. 2048 Bytes pro Eintrag,
 * daher chunken wir größere Werte.
 */
const CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        const chunks: string[] = [];
        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) chunks.push(chunk);
        }
        return chunks.join('');
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (value.length > CHUNK_SIZE) {
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE));
        }
        await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('SecureStore setItem Fehler:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        await SecureStore.deleteItemAsync(`${key}_chunks`);
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('SecureStore removeItem Fehler:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
