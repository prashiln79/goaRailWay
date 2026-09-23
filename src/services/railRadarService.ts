/**
 * RailRadar API Service
 *
 * Fetches trains between corridor stations from the RailRadar API.
 * Results are cached in kvStore for 7 days to minimize API calls.
 *
 * API: https://api.railradar.in/v1
 * Auth: Bearer token in Authorization header
 * Endpoint: GET /trains/between/{from}/{to}
 */

import { kvStore } from '../utils/kvStore';

const RAILRADAR_BASE = 'https://api.railradar.in/v1';
const RAILRADAR_API_KEY = 'rg_b3db7413753f486380f5cfbf785f0b4b';

const CACHE_KEY = 'railradar_corridor_cache_v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RailRadarTrain {
  train_number: string;
  train_name: string;
  source_station_code: string;
  source_station_name?: string;
  destination_station_code: string;
  destination_station_name?: string;
  departure_time: string;
  arrival_time: string;
  running_days: number[]; // 0=Sun..6=Sat
  train_type?: string;
  distance?: number;
  duration?: number;
  total_halts?: number;
}

const DAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

// Key corridor pairs to capture all Goa-Mumbai corridor routes
const CORRIDOR_PAIRS: Array<{ from: string; to: string }> = [
  { from: 'CSMT', to: 'MAO' },
  { from: 'MAO',  to: 'CSMT' },
  { from: 'LTT',  to: 'MAO' },
  { from: 'MAO',  to: 'LTT' },
  { from: 'PNVL', to: 'MAO' },
  { from: 'MAO',  to: 'PNVL' },
  { from: 'CSMT', to: 'SWV' },
  { from: 'SWV',  to: 'CSMT' },
  { from: 'DR',   to: 'SWV' },
  { from: 'SWV',  to: 'DR' },
];

interface CachedCorridorData {
  fetchedAt: number;
  trains: RailRadarTrain[];
}

async function fetchTrainsBetween(
  from: string,
  to: string,
): Promise<RailRadarTrain[]> {
  const url = `${RAILRADAR_BASE}/trains/between/${from}/${to}`;
  const headers = {
    Authorization: `Bearer ${RAILRADAR_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const res = await fetch(url, { headers, method: 'GET' });
    if (!res.ok) return [];

    const json = await res.json();
    const list = json.data?.trains ?? json.trains ?? [];
    if (!Array.isArray(list)) return [];

    const parsed: RailRadarTrain[] = [];
    for (const item of list) {
      if (!item.train?.number) continue;

      const rawDays: string[] = item.train.runDays || [];
      const days = rawDays
        .map((d) => DAY_MAP[d.toLowerCase()])
        .filter((d): d is number => d !== undefined);

      parsed.push({
        train_number: item.train.number.trim(),
        train_name: item.train.name?.trim() ?? `Train ${item.train.number}`,
        train_type: item.train.type ?? 'Express',
        source_station_code: item.from?.code ?? from,
        source_station_name: item.from?.name,
        destination_station_code: item.to?.code ?? to,
        destination_station_name: item.to?.name,
        departure_time: item.from?.departure ?? '00:00',
        arrival_time: item.to?.arrival ?? '00:00',
        running_days: days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6],
        distance: item.distance,
        duration: item.duration,
        total_halts: item.totalHaltsBetween,
      });
    }

    return parsed;
  } catch (err) {
    console.warn(`[RailRadar] Failed to fetch ${from}->${to}:`, err);
    return [];
  }
}

/**
 * Returns all corridor trains fetched from the RailRadar external API.
 */
export async function getRailRadarCorridorTrains(forceFetch = false): Promise<RailRadarTrain[]> {
  if (!forceFetch) {
    const cached = await kvStore.get<CachedCorridorData>(CACHE_KEY);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      console.log(`[RailRadar] Serving ${cached.trains.length} corridor trains from cache`);
      return cached.trains;
    }
  }

  console.log('[RailRadar] Fetching corridor trains from RailRadar API...');
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

  if (allTrains.length > 0) {
    await kvStore.set<CachedCorridorData>(CACHE_KEY, {
      fetchedAt: Date.now(),
      trains: allTrains,
    });
    console.log(`[RailRadar] Successfully fetched & cached ${allTrains.length} unique trains`);
  }

  return allTrains;
}

export async function clearRailRadarCache(): Promise<void> {
  await kvStore.remove(CACHE_KEY);
}
