/**
 * Special Trains Normalizer
 *
 * Converts raw RailRadarTrain entries → our internal Train type.
 * Deduplicates against the hardcoded TRAINS list so we never show
 * the same train twice.
 *
 * Special trains have no detailed stop data from the API, so their
 * stops[] is built with just the source → destination pair.
 */

import { Train, TrainType } from '../types/Train';
import { RailRadarTrain } from './railRadarService';
import { TRAINS } from '../data/trains';

// Pre-build a set of hardcoded train numbers for O(1) lookups
const HARDCODED_NUMBERS = new Set(TRAINS.map(t => t.trainNumber));

// Day-string parsing helpers (some APIs return "SMTWTFS" format)
// Index: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const DAY_CHARS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

function parseRunningDays(train: RailRadarTrain): number[] {
  // If API sends numeric array directly
  if (Array.isArray(train.running_days) && train.running_days.length > 0) {
    return train.running_days;
  }

  // Parse "SMTWTFS" or "1000010" style strings
  const str = train.days_of_run;
  if (!str) return [0, 1, 2, 3, 4, 5, 6]; // default: daily if unknown

  if (str.length === 7) {
    const days: number[] = [];
    for (let i = 0; i < 7; i++) {
      const ch = str[i];
      if (ch && ch !== '-' && ch !== '0' && ch !== 'N') {
        days.push(i);
      }
    }
    return days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];
  }

  return [0, 1, 2, 3, 4, 5, 6];
}

function parseTrainType(train: RailRadarTrain): TrainType {
  const t = (train.train_type ?? '').toUpperCase();
  const name = (train.train_name ?? '').toLowerCase();

  if (t.includes('RAJ') || name.includes('rajdhani')) return 'Rajdhani';
  if (t.includes('VB')  || name.includes('vande bharat')) return 'VandeBharat';
  if (t.includes('TEJ') || name.includes('tejas')) return 'Tejas';
  if (t.includes('SF')  || name.includes('superfast') ||
      train.train_number.startsWith('12') ||
      train.train_number.startsWith('20') ||
      train.train_number.startsWith('22')) return 'Express';
  if (t.includes('PASS') || name.includes('passenger')) return 'Passenger';
  if (t.includes('MAIL') || name.includes('mail')) return 'Mail';

  return 'Express'; // safe default
}

/**
 * Converts a RailRadarTrain to our internal Train format.
 * Returns null if the train is already in the hardcoded list.
 */
function normalizeToTrain(raw: RailRadarTrain): Train | null {
  const num = raw.train_number?.trim();
  if (!num) return null;

  // Skip trains already in hardcoded dataset
  if (HARDCODED_NUMBERS.has(num)) return null;

  const src = raw.source_station_code?.toUpperCase() ?? '';
  const dst = raw.destination_station_code?.toUpperCase() ?? '';
  const depTime = raw.departure_time ?? '00:00';
  const arrTime = raw.arrival_time ?? '00:00';

  return {
    id: num,
    trainNumber: num,
    name: raw.train_name ?? `Train ${num}`,
    sourceStationCode: src,
    destinationStationCode: dst,
    runningDays: parseRunningDays(raw),
    type: parseTrainType(raw),
    isSpecial: true,
    stops: [
      {
        stationCode: src,
        sequence: 1,
        departureTime: depTime,
        dayOffset: 0,
      },
      {
        stationCode: dst,
        sequence: 2,
        arrivalTime: arrTime,
        dayOffset: 0,
      },
    ],
  };
}

/**
 * Converts an array of RailRadarTrain entries to Train objects,
 * filtering out duplicates of the hardcoded list.
 *
 * @returns Only the NEW special trains not already in TRAINS[]
 */
export function normalizeSpecialTrains(rawTrains: RailRadarTrain[]): Train[] {
  const specials: Train[] = [];
  const seen = new Set<string>();

  for (const raw of rawTrains) {
    if (seen.has(raw.train_number)) continue;
    seen.add(raw.train_number);

    const train = normalizeToTrain(raw);
    if (train) {
      specials.push(train);
    }
  }

  return specials;
}

/**
 * Merges the hardcoded TRAINS list with special trains fetched from RailRadar.
 * Hardcoded trains always take precedence.
 *
 * @param specials - Output of normalizeSpecialTrains()
 * @returns Combined and deduplicated train list
 */
export function mergeWithHardcoded(specials: Train[]): Train[] {
  if (specials.length === 0) return TRAINS;
  return [...TRAINS, ...specials];
}
