/**
 * Train Sync Service
 *
 * Checks if train data in Firebase Firestore is more than 1 week old.
 * If it is, fetches the latest corridor train schedule from the RailRadar API
 * and updates Firestore in the background.
 *
 * Runs automatically on app start (non-blocking).
 */

import { Train, TrainType } from '../types/Train';
import {
  getFirebaseTrains,
  getFirebaseTrainsLastUpdated,
  saveFirebaseTrains,
} from './firebaseTrainService';
import { getRailRadarCorridorTrains, RailRadarTrain } from './railRadarService';
import { kvStore } from '../utils/kvStore';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Maps raw train_type string from RailRadar to application TrainType
 */
function mapTrainType(rawType?: string): TrainType {
  const t = (rawType ?? '').toUpperCase();
  if (t.includes('VANDE')) return 'VandeBharat';
  if (t.includes('TEJAS')) return 'Tejas';
  if (t.includes('RAJDHANI')) return 'Rajdhani';
  if (t.includes('MAIL')) return 'Mail';
  if (t.includes('DEMU')) return 'DEMU';
  if (t.includes('PASS')) return 'Passenger';
  return 'Express';
}

/**
 * Synchronizes trains from RailRadar API to Firebase Firestore.
 */
export async function syncTrainsFromRailRadarToFirebase(): Promise<number> {
  console.log('[TrainSync] 🔄 Starting sync from RailRadar API to Firebase Firestore...');

  // 1. Fetch latest trains from RailRadar API
  const apiTrains: RailRadarTrain[] = await getRailRadarCorridorTrains(true);
  if (!apiTrains || apiTrains.length === 0) {
    console.warn('[TrainSync] RailRadar API returned 0 trains — skipping Firebase update');
    return 0;
  }

  // 2. Load existing trains from Firebase
  const existingTrains = await getFirebaseTrains();
  const trainMap = new Map<string, Train>(existingTrains.map((t) => [t.trainNumber, t]));

  let updatedCount = 0;
  let newCount = 0;

  // 3. Merge RailRadar data into trainMap
  for (const rTrain of apiTrains) {
    const num = rTrain.train_number;
    const existing = trainMap.get(num);

    if (existing) {
      // Update existing train: preserve intermediate stops, update timings & days
      const updatedStops = [...existing.stops];
      if (updatedStops.length > 0 && rTrain.departure_time) {
        updatedStops[0] = {
          ...updatedStops[0],
          departureTime: rTrain.departure_time,
        };
      }
      if (updatedStops.length > 1 && rTrain.arrival_time) {
        const lastIdx = updatedStops.length - 1;
        updatedStops[lastIdx] = {
          ...updatedStops[lastIdx],
          arrivalTime: rTrain.arrival_time,
        };
      }

      trainMap.set(num, {
        ...existing,
        name: rTrain.train_name || existing.name,
        runningDays: rTrain.running_days.length > 0 ? rTrain.running_days : existing.runningDays,
        type: existing.type || mapTrainType(rTrain.train_type),
        stops: updatedStops,
      });
      updatedCount++;
    } else {
      // New train discovered from API (e.g. seasonal special train)
      const newTrain: Train = {
        id: num,
        trainNumber: num,
        name: rTrain.train_name,
        sourceStationCode: rTrain.source_station_code,
        destinationStationCode: rTrain.destination_station_code,
        runningDays: rTrain.running_days,
        type: mapTrainType(rTrain.train_type),
        isSpecial: true,
        stops: [
          {
            stationCode: rTrain.source_station_code,
            sequence: 1,
            departureTime: rTrain.departure_time,
            dayOffset: 0,
          },
          {
            stationCode: rTrain.destination_station_code,
            sequence: 2,
            arrivalTime: rTrain.arrival_time,
            dayOffset: 0,
          },
        ],
      };
      trainMap.set(num, newTrain);
      newCount++;
    }
  }

  const mergedTrains = Array.from(trainMap.values());
  console.log(`[TrainSync] Merged ${mergedTrains.length} total trains (${updatedCount} updated, ${newCount} newly added)`);

  // 4. Save to Firestore and refresh cache
  await saveFirebaseTrains(mergedTrains, 'RailRadar Weekly Auto-Sync');
  console.log('[TrainSync] ✅ Firebase Firestore successfully updated with latest train timetable');

  return mergedTrains.length;
}

let _isSyncing = false;
const LOCAL_CHECK_KEY = 'trains_last_weekly_check_ts';
const LOCAL_CHECK_THROTTLE_MS = 12 * 60 * 60 * 1000; // 12 hours local device throttle

/**
 * Checks if Firebase data is 1 week old. If so, triggers the RailRadar sync in the background.
 *
 * Guaranteed to NOT call RailRadar unnecessarily:
 *   1. In-flight lock: Prevents duplicate simultaneous executions.
 *   2. Local throttle: Skips checks if checked on this device in the last 12 hours.
 *   3. Shared Firebase timestamp: If ANY user synced within 7 days, no API call is made.
 *
 * @param force If true, skips the 1-week age check and syncs immediately.
 * @returns true if sync was performed, false if data was already fresh.
 */
export async function checkAndSyncWeeklyTrains(force = false): Promise<boolean> {
  // Guard 1: In-flight lock
  if (_isSyncing) {
    console.log('[TrainSync] Sync already in progress — skipping');
    return false;
  }

  // Guard 2: Local device throttle (skip even checking Firestore if recently verified)
  if (!force) {
    const lastLocalCheck = await kvStore.get<number>(LOCAL_CHECK_KEY);
    if (lastLocalCheck && Date.now() - lastLocalCheck < LOCAL_CHECK_THROTTLE_MS) {
      // Checked recently on this device, skip
      return false;
    }
  }

  _isSyncing = true;

  try {
    const lastUpdated = await getFirebaseTrainsLastUpdated();
    const now = Date.now();

    // Guard 3: Check master timestamp in Firestore (7-day threshold)
    const isOlderThanAWeek =
      !lastUpdated || now - lastUpdated.getTime() >= ONE_WEEK_MS;

    if (force || isOlderThanAWeek) {
      const daysOld = lastUpdated
        ? Math.round((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
        : 'unknown';
      console.log(`[TrainSync] ⏳ Firebase train data is ${daysOld} days old (>= 7 days). Updating from RailRadar API...`);

      await syncTrainsFromRailRadarToFirebase();
      await kvStore.set<number>(LOCAL_CHECK_KEY, Date.now());
      return true;
    }

    const daysOld = Math.round((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`[TrainSync] ⚡ Firebase train data is fresh (updated ${daysOld} day(s) ago). No API call needed.`);
    await kvStore.set<number>(LOCAL_CHECK_KEY, Date.now());
    return false;
  } catch (err) {
    console.warn('[TrainSync] Failed to perform weekly sync check:', err);
    return false;
  } finally {
    _isSyncing = false;
  }
}
