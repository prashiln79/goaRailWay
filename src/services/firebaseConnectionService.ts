/**
 * Firebase Connection Service
 *
 * Reads curated connection options from Firestore (`connections` collection).
 * Results are cached in AsyncStorage for 7 days.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ensureSignedIn } from './authService';
import { ConnectionOption } from '../types/Connection';

const CACHE_KEY = 'firebase_connections_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CONNECTIONS_COLLECTION = 'connections';
const META_DOC_ID = '_meta';

interface ConnectionsCache {
  fetchedAt: number;
  connections: ConnectionOption[];
}

async function readCache(): Promise<ConnectionsCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConnectionsCache;
  } catch {
    return null;
  }
}

async function writeCache(connections: ConnectionOption[]): Promise<void> {
  try {
    const payload: ConnectionsCache = { fetchedAt: Date.now(), connections };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[FirebaseConnectionService] Failed to write cache:', err);
  }
}

export async function getFirebaseConnections(): Promise<ConnectionOption[]> {
  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.connections;
  }

  try {
    try {
      await ensureSignedIn();
    } catch {
      // Continue unauthenticated if rules allow
    }

    const colRef = collection(db, CONNECTIONS_COLLECTION);
    const snapshot = await getDocs(colRef);

    const connections: ConnectionOption[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id === META_DOC_ID) return;
      connections.push(docSnap.data() as ConnectionOption);
    });

    if (connections.length > 0) {
      await writeCache(connections);
    }
    return connections;
  } catch (err) {
    console.warn('[FirebaseConnectionService] Fetch failed:', err);
    return [];
  }
}
