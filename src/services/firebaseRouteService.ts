/**
 * Firebase Route Service
 *
 * Reads railway route polylines from Firestore (`routes` collection).
 * Results are cached in AsyncStorage for 7 days.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ensureSignedIn } from './authService';
import { RailwayRoute } from '../types/RailwayRoute';

const CACHE_KEY = 'firebase_routes_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROUTES_COLLECTION = 'routes';
const META_DOC_ID = '_meta';

interface RoutesCache {
  fetchedAt: number;
  routes: RailwayRoute[];
}

async function readCache(): Promise<RoutesCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RoutesCache;
  } catch {
    return null;
  }
}

async function writeCache(routes: RailwayRoute[]): Promise<void> {
  try {
    const payload: RoutesCache = { fetchedAt: Date.now(), routes };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[FirebaseRouteService] Failed to write cache:', err);
  }
}

export async function getFirebaseRoutes(): Promise<RailwayRoute[]> {
  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.routes;
  }

  try {
    try {
      await ensureSignedIn();
    } catch {
      // Continue unauthenticated if rules allow
    }

    const colRef = collection(db, ROUTES_COLLECTION);
    const snapshot = await getDocs(colRef);

    const routes: RailwayRoute[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id === META_DOC_ID) return;
      routes.push(docSnap.data() as RailwayRoute);
    });

    if (routes.length === 0) {
      return [];
    }

    await writeCache(routes);
    return routes;
  } catch (err) {
    console.warn('[FirebaseRouteService] Fetch failed:', err);
    return [];
  }
}
