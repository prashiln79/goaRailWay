import { Train } from '../types/Train';

/**
 * Train dataset is now fully dynamic and fetched from Firebase Firestore
 * (with 7-day AsyncStorage caching for fast, offline startup).
 *
 * Master seed timetable is preserved in `scripts/seedData/trains.ts`.
 * To update or re-seed Firebase, run:
 *   npx ts-node --project tsconfig.seed.json --transpile-only scripts/seedAllFirestore.ts
 */
export const TRAINS: Train[] = [];
export const TRAIN_MAP: Record<string, Train> = {};
