/**
 * RailRadar API Service
 *
 * Fetches trains between corridor stations from the RailRadar API.
 * Results are cached in kvStore for 7 days to minimize API calls (~8/month).
 *
 * API: https://api.railradar.in/v1
 * Auth: Bearer token in Authorization header
 * Endpoint: GET /trains/between/{from}/{to}
 *   also: GET /legacy/trains/between?from={from}&to={to}
 */

import { kvStore } from '../utils/kvStore';

const RAILRADAR_BASE = 'https://api.railradar.in/v1';
// NOTE: Keep the key in a config/env file for production. Hardcoded here for V1.
const RAILRADAR_API_KEY = 'rg_b3db7413753f486380f5cfbf785f0b4b';

/** Cache version — bump this to invalidate all existing caches */
const CACHE_KEY = 'railradar_corridor_cache_v1';
/** 7 days in milliseconds */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Raw API response shape ────────────────────────────────────────────────
export interface RailRadarTrain {
  train_number: string;
  train_name: string;
  source_station_code: string;
  source_station_name?: string;
  destination_station_code: string;
  destination_station_name?: string;
  departure_time?: string;     // "HH:MM" at source
  arrival_time?: string;       // "HH:MM" at destination
  duration?: string;           // "HH:MM" or "Xh Ym"
  running_days?: number[];     // JS day indices 0=Sun..6=Sat
  days_of_run?: string;        // e.g. "SMTWTFS" or "1000010"
  train_type?: string;         // "EXP" | "SF" | "PASS" | etc.
  distance?: number;
  classes?: string[];
  // Some endpoints return this field for specials
  is_special?: boolean | 0 | 1;
}

interface RailRadarTrainsResponse {
  trains?: RailRadarTrain[];
  data?: RailRadarTrain[];
  total?: number;
  error?: string;
  message?: string;
}

// ─── Cache envelope ────────────────────────────────────────────────────────
interface CachedCorridorData {
  fetchedAt: number;         // Date.now()
  trains: RailRadarTrain[];
}

// ─── Corridor station pairs to fetch ──────────────────────────────────────
const CORRIDOR_PAIRS: Array<{ from: string; to: string }> = [
  { from: 'CSMT', to: 'MAO' },  // Mumbai CSMT → Madgaon (covers most southbound)
  { from: 'LTT',  to: 'MAO' },  // LTT → Madgaon
  { from: 'MAO',  to: 'CSMT' }, // Madgaon → CSMT (northbound)
  { from: 'MAO',  to: 'LTT' },  // Madgaon → LTT
];

// ─── Internals ─────────────────────────────────────────────────────────────

async function fetchTrainsBetween(
  from: string,
  to: string,
): Promise<RailRadarTrain[]> {
  // Try v1 endpoint first, fall back to legacy
  const urls = [
    `${RAILRADAR_BASE}/trains/between/${from}/${to}`,
    `${RAILRADAR_BASE}/legacy/trains/between?from=${from}&to=${to}`,
  ];

  const headers = {
    'Authorization': `Bearer ${RAILRADAR_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers, method: 'GET' });
      if (!res.ok) continue;

      const json: RailRadarTrainsResponse = await res.json();
      const trains = json.trains ?? json.data ?? [];
      if (Array.isArray(trains) && trains.length > 0) {
        return trains;
      }
    } catch {
      // Network error — try next URL
    }
  }

  return [];
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Returns all corridor trains fetched from RailRadar.
 * Results are cached for 7 days. On failure returns an empty array
 * (the caller falls back to hardcoded data).
 */
export async function getRailRadarCorridorTrains(): Promise<RailRadarTrain[]> {
  // 1. Check cache
  const cached = await kvStore.get<CachedCorridorData>(CACHE_KEY);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    console.log(`[RailRadar] Serving ${cached.trains.length} trains from cache`);
    return cached.trains;
  }

  // 2. Fetch all corridor pairs
  console.log('[RailRadar] Fetching corridor trains from API...');
  const seenNumbers = new Set<string>();
  const allTrains: RailRadarTrain[] = [];

  const results = await Promise.allSettled(
    CORRIDOR_PAIRS.map(({ from, to }) => fetchTrainsBetween(from, to)),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const train of result.value) {
        if (!seenNumbers.has(train.train_number)) {
          seenNumbers.add(train.train_number);
          allTrains.push(train);
        }
      }
    }
  }

  // 3. Cache if we got anything
  if (allTrains.length > 0) {
    await kvStore.set<CachedCorridorData>(CACHE_KEY, {
      fetchedAt: Date.now(),
      trains: allTrains,
    });
    console.log(`[RailRadar] Cached ${allTrains.length} corridor trains`);
  } else {
    console.warn('[RailRadar] API returned no trains — falling back to hardcoded data');
  }

  return allTrains;
}

/** Clear the cache (e.g., for forced refresh) */
export async function clearRailRadarCache(): Promise<void> {
  await kvStore.remove(CACHE_KEY);
}
