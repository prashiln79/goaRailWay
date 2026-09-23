/**
 * Firebase Train Service
 *
 * Reads all train documents from Firestore (`trains` collection).
 * Results are cached in AsyncStorage for 7 days to minimise Firestore reads.
 *
 * Cache strategy:
 *   1. Check AsyncStorage for a cached snapshot + timestamp.
 *   2. If fresh (< 7 days), return cached trains immediately — zero Firestore reads.
 *   3. Otherwise fetch the full `trains` collection, update cache, return trains.
 *   4. On Firestore failure, fall back silently to the hardcoded TRAINS array.
 *
 * Seeding:
 *   Run `npx ts-node scripts/seedFirestore.ts` to upload / refresh Firestore data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ensureSignedIn } from './authService';
import { Train } from '../types/Train';

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_KEY = 'firebase_trains_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const TRAINS_COLLECTION = 'trains';
const META_DOC_ID = '_meta';

// ─── Cache envelope ───────────────────────────────────────────────────────────

interface TrainsCache {
  fetchedAt: number;   // Date.now()
  trains: Train[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readCache(): Promise<TrainsCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TrainsCache;
  } catch {
    return null;
  }
}

async function writeCache(trains: Train[]): Promise<void> {
  try {
    const payload: TrainsCache = { fetchedAt: Date.now(), trains };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[FirebaseTrainService] Failed to write cache:', err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all trains from Firestore (or cache).
 * Falls back to the hardcoded TRAINS array if Firestore is unavailable.
 */
export async function getFirebaseTrains(): Promise<Train[]> {
  // 1. Try the AsyncStorage cache first
  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    console.log(`[FirebaseTrainService] Serving ${cached.trains.length} trains from cache`);
    return cached.trains;
  }

  // 2. Try anonymous sign-in, then fetch from Firestore
  try {
    try {
      await ensureSignedIn();
    } catch (authErr) {
      console.warn('[FirebaseTrainService] Anonymous auth skipped or unavailable, attempting read...', authErr);
    }
    console.log('[FirebaseTrainService] Fetching trains from Firestore...');
    const colRef = collection(db, TRAINS_COLLECTION);
    const snapshot = await getDocs(colRef);

    const trains: Train[] = [];
    snapshot.forEach((docSnap) => {
      // Skip the metadata document
      if (docSnap.id === META_DOC_ID) return;
      const data = docSnap.data() as Train;
      trains.push(data);
    });

    if (trains.length === 0) {
      console.warn('[FirebaseTrainService] Firestore returned 0 trains');
      return [];
    }

    console.log(`[FirebaseTrainService] Fetched ${trains.length} trains from Firestore`);
    await writeCache(trains);
    return trains;
  } catch (err) {
    console.warn('[FirebaseTrainService] Firestore fetch failed:', err);
    return [];
  }
}

/**
 * Returns the timestamp when Firestore data was last seeded/updated.
 * Returns null if the metadata document doesn't exist.
 */
export async function getFirebaseTrainsLastUpdated(): Promise<Date | null> {
  try {
    const metaRef = doc(db, TRAINS_COLLECTION, META_DOC_ID);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const data = metaSnap.data();
      if (data?.lastUpdatedAt?.toDate) {
        return data.lastUpdatedAt.toDate() as Date;
      }
    }
  } catch {
    // Silently ignore — metadata is informational only
  }
  return null;
}

/**
 * Clears the local AsyncStorage cache, forcing a fresh Firestore fetch
 * on the next call to getFirebaseTrains().
 */
export async function clearFirebaseTrainsCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('[FirebaseTrainService] Cache cleared');
  } catch (err) {
    console.warn('[FirebaseTrainService] Failed to clear cache:', err);
  }
}
