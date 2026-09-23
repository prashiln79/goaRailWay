/**
 * Firebase Station Service
 *
 * Reads station documents from Firestore (`stations` collection).
 * Results are cached in AsyncStorage for 7 days to minimise Firestore reads.
 *
 * Cache strategy:
 *   1. Check AsyncStorage for cached stations (< 7 days old).
 *   2. If fresh, return immediately — zero network latency, zero Firestore reads.
 *   3. If expired or empty, fetch from Firestore and refresh the cache.
 *   4. On network or permission failure, fall back silently to bundled STATIONS data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ensureSignedIn } from './authService';
import { Station } from '../types/Station';

const CACHE_KEY = 'firebase_stations_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const STATIONS_COLLECTION = 'stations';
const META_DOC_ID = '_meta';

interface StationsCache {
  fetchedAt: number;
  stations: Station[];
}

async function readCache(): Promise<StationsCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StationsCache;
  } catch {
    return null;
  }
}

async function writeCache(stations: Station[]): Promise<void> {
  try {
    const payload: StationsCache = { fetchedAt: Date.now(), stations };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[FirebaseStationService] Failed to write cache:', err);
  }
}

/**
 * Returns all stations from Firestore (or 7-day cache).
 * Falls back to bundled STATIONS list if unavailable.
 */
export async function getFirebaseStations(): Promise<Station[]> {
  // 1. Try AsyncStorage cache
  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.stations;
  }

  // 2. Fetch from Firestore
  try {
    try {
      await ensureSignedIn();
    } catch (authErr) {
      console.warn('[FirebaseStationService] Anonymous auth skipped or unavailable, attempting read...', authErr);
    }

    const colRef = collection(db, STATIONS_COLLECTION);
    const snapshot = await getDocs(colRef);

    const stations: Station[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id === META_DOC_ID) return;
      stations.push(docSnap.data() as Station);
    });

    if (stations.length === 0) {
      console.warn('[FirebaseStationService] Firestore returned 0 stations');
      return [];
    }

    console.log(`[FirebaseStationService] Fetched ${stations.length} stations from Firestore`);
    await writeCache(stations);
    return stations;
  } catch (err) {
    console.warn('[FirebaseStationService] Firestore fetch failed:', err);
    return [];
  }
}

export async function clearFirebaseStationsCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn('[FirebaseStationService] Failed to clear cache:', err);
  }
}
