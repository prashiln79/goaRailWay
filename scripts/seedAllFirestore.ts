/**
 * Comprehensive Firestore Seed Script — Goa Railway App
 *
 * Uploads ALL application datasets to Firebase Firestore:
 *   1. Trains collection (`trains`) — 72 trains
 *   2. Stations collection (`stations`) — 53 stations
 *   3. Routes collection (`routes`) — corridor polyline tracks
 *   4. Connections collection (`connections`) — curated connecting journeys
 *   5. App Config collection (`app_config`):
 *      - `search_destinations` (Goa + nearby destination points)
 *      - `station_alternatives` (Goa, Mumbai, nearby regional station cards)
 *      - `corridor_hubs` (Corridor origin/destination hubs)
 *
 * Usage:
 *   npx ts-node --project tsconfig.seed.json --transpile-only scripts/seedAllFirestore.ts
 */

import 'cross-fetch/polyfill';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  writeBatch,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCbi9w0M2U4jtO6tkf78SHvXrgvL4TbyqI',
  authDomain: 'money-manager-b394e.firebaseapp.com',
  projectId: 'money-manager-b394e',
  storageBucket: 'money-manager-b394e.firebasestorage.app',
  messagingSenderId: '844099376199',
  appId: '1:844099376199:web:d778d53279e65258b48d62',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TRAINS } = require('./seedData/trains');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { STATIONS } = require('./seedData/stations');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { RAILWAY_ROUTES } = require('./seedData/routes');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MOCK_CONNECTIONS } = require('./seedData/connections');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GOA_DESTINATIONS, NEARBY_DESTINATIONS } = require('./seedData/searchDestinations');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  GOA_STATIONS_DATA,
  NEARBY_ALTERNATIVE_STATIONS_DATA,
  MUMBAI_STATIONS_DATA,
} = require('./seedData/stationAlternatives');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CORRIDOR_HUBS, EXTENDED_CORRIDOR_HUBS } = require('./seedData/corridorHubs');

/** Strip any undefined values since Firestore rejects undefined */
function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        clean[k] = sanitize(v);
      }
    }
    return clean;
  }
  return obj;
}

const BATCH_LIMIT = 450;

async function seedAll(): Promise<void> {
  console.log('\n🚀 Starting full Firestore dataset upload to project: money-manager-b394e...\n');

  try {
    const userCredential = await signInAnonymously(auth);
    console.log(`🔐 Authenticated anonymously as: ${userCredential.user.uid}`);
  } catch (authErr: any) {
    console.warn(`⚠️ Anonymous auth skipped (${authErr.message}). Continuing with rules-based access...`);
  }

  // ─────────────────────────────────────────────
  // 1. TRAINS (72 items)
  // ─────────────────────────────────────────────
  console.log(`\n🚂 1/5 Uploading ${TRAINS.length} trains...`);
  for (let i = 0; i < TRAINS.length; i += BATCH_LIMIT) {
    const chunk = TRAINS.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);
    for (const train of chunk) {
      const ref = doc(db, 'trains', train.trainNumber);
      batch.set(ref, sanitize(train));
    }
    await batch.commit();
    console.log(`   ✅ Seeded ${chunk.length} trains (${i + chunk.length}/${TRAINS.length})`);
  }
  await setDoc(doc(db, 'trains', '_meta'), {
    lastUpdatedAt: serverTimestamp(),
    count: TRAINS.length,
    version: '1.0.0',
  });

  // ─────────────────────────────────────────────
  // 2. STATIONS (53 items)
  // ─────────────────────────────────────────────
  console.log(`\n🚉 2/5 Uploading ${STATIONS.length} stations...`);
  for (let i = 0; i < STATIONS.length; i += BATCH_LIMIT) {
    const chunk = STATIONS.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);
    for (const station of chunk) {
      const ref = doc(db, 'stations', station.code);
      batch.set(ref, sanitize(station));
    }
    await batch.commit();
    console.log(`   ✅ Seeded ${chunk.length} stations (${i + chunk.length}/${STATIONS.length})`);
  }
  await setDoc(doc(db, 'stations', '_meta'), {
    lastUpdatedAt: serverTimestamp(),
    count: STATIONS.length,
    version: '1.0.0',
  });

  // ─────────────────────────────────────────────
  // 3. RAILWAY ROUTES (polylines)
  // ─────────────────────────────────────────────
  console.log(`\n🗺️  3/5 Uploading ${RAILWAY_ROUTES.length} corridor routes...`);
  const routesBatch = writeBatch(db);
  for (const route of RAILWAY_ROUTES) {
    const ref = doc(db, 'routes', route.id);
    routesBatch.set(ref, sanitize(route));
  }
  await routesBatch.commit();
  await setDoc(doc(db, 'routes', '_meta'), {
    lastUpdatedAt: serverTimestamp(),
    count: RAILWAY_ROUTES.length,
  });
  console.log(`   ✅ Seeded ${RAILWAY_ROUTES.length} routes`);

  // ─────────────────────────────────────────────
  // 4. CONNECTIONS
  // ─────────────────────────────────────────────
  console.log(`\n🔀 4/5 Uploading ${MOCK_CONNECTIONS.length} curated connections...`);
  const connectionsBatch = writeBatch(db);
  for (const conn of MOCK_CONNECTIONS) {
    const ref = doc(db, 'connections', conn.id);
    connectionsBatch.set(ref, sanitize(conn));
  }
  await connectionsBatch.commit();
  await setDoc(doc(db, 'connections', '_meta'), {
    lastUpdatedAt: serverTimestamp(),
    count: MOCK_CONNECTIONS.length,
  });
  console.log(`   ✅ Seeded ${MOCK_CONNECTIONS.length} connections`);

  // ─────────────────────────────────────────────
  // 5. APP CONFIG (Destinations, Alternatives, Hubs)
  // ─────────────────────────────────────────────
  console.log('\n⚙️  5/5 Uploading app configuration documents...');
  const configBatch = writeBatch(db);

  // Search Destinations
  configBatch.set(doc(db, 'app_config', 'search_destinations'), sanitize({
    goaDestinations: GOA_DESTINATIONS,
    nearbyDestinations: NEARBY_DESTINATIONS,
    lastUpdatedAt: serverTimestamp(),
  }));

  // Station Alternatives
  configBatch.set(doc(db, 'app_config', 'station_alternatives'), sanitize({
    goaStationsData: GOA_STATIONS_DATA,
    nearbyAlternativeStationsData: NEARBY_ALTERNATIVE_STATIONS_DATA,
    mumbaiStationsData: MUMBAI_STATIONS_DATA,
    lastUpdatedAt: serverTimestamp(),
  }));

  // Corridor Hubs
  configBatch.set(doc(db, 'app_config', 'corridor_hubs'), sanitize({
    corridorHubs: CORRIDOR_HUBS,
    extendedCorridorHubs: EXTENDED_CORRIDOR_HUBS,
    lastUpdatedAt: serverTimestamp(),
  }));

  // Full Database Metadata
  configBatch.set(doc(db, 'app_config', '_meta'), {
    lastFullSyncAt: serverTimestamp(),
    trainsCount: TRAINS.length,
    stationsCount: STATIONS.length,
    routesCount: RAILWAY_ROUTES.length,
    connectionsCount: MOCK_CONNECTIONS.length,
    schemaVersion: 1,
  });

  await configBatch.commit();
  console.log('   ✅ Seeded app_config documents (destinations, alternatives, corridor hubs)');

  console.log('\n🎉 ALL DATASETS SUCCESSFULLY SEEDED TO FIRESTORE!');
  console.log('   Firebase Console: https://console.firebase.google.com/project/money-manager-b394e/firestore\n');
  process.exit(0);
}

seedAll().catch((err: any) => {
  console.error('\n❌ Seed failed:', err.message ?? err);

  if (err.code === 'permission-denied' || String(err).includes('PERMISSION_DENIED')) {
    console.error('\n📋 To fix this Firestore permission error:');
    console.error('  1. Open Firebase Console: https://console.firebase.google.com/project/money-manager-b394e/firestore/rules');
    console.error('  2. Replace your rules with:');
    console.error('       rules_version = \'2\';');
    console.error('       service cloud.firestore {');
    console.error('         match /databases/{database}/documents {');
    console.error('           match /{document=**} {');
    console.error('             allow read, write: if true;');
    console.error('           }');
    console.error('         }');
    console.error('       }');
    console.error('  3. Click "Publish", then re-run:');
    console.error('       npx ts-node --project tsconfig.seed.json --transpile-only scripts/seedAllFirestore.ts');
  }

  process.exit(1);
});
