/**
 * Firestore Seed Script — Goa Railway App
 *
 * Uploads all trains from the local `src/data/trains.ts` to Firestore
 * using the standard Firebase JS SDK (same package used by the app).
 *
 * NO service account or special credentials needed — uses the same
 * public Firebase config as the app.
 *
 * IMPORTANT: This requires your Firestore rules to temporarily allow writes,
 * OR you can run it while rules allow authenticated writes and the script
 * signs in anonymously first (automatic).
 *
 * For the initial seed, set Firestore rules to:
 *   allow write: if true;   ← temporary, change back after seeding!
 *
 * Usage:
 *   npx ts-node --project tsconfig.seed.json --transpile-only scripts/seedFirestore.ts
 */

// Polyfill fetch for Node.js (< 18)
import 'cross-fetch/polyfill';

import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

// Import trains from master seed data
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TRAINS } = require('./seedData/trains');

const TRAINS_COLLECTION = 'trains';
const BATCH_SIZE = 499; // Firestore max = 500 ops per batch; reserve 1 for metadata

async function seed(): Promise<void> {
  console.log(`\n🚂 Seeding ${TRAINS.length} trains to Firestore (project: money-manager-b394e)...`);

  try {
    const userCredential = await signInAnonymously(auth);
    console.log(`🔐 Authenticated anonymously as: ${userCredential.user.uid}`);
  } catch (authErr: any) {
    console.warn(`⚠️ Anonymous auth failed (${authErr.message}). Proceeding unauthenticated...`);
  }

  let total = 0;
  let batchIndex = 0;

  for (let i = 0; i < TRAINS.length; i += BATCH_SIZE) {
    const chunk = TRAINS.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const train of chunk) {
      const ref = doc(db, TRAINS_COLLECTION, train.trainNumber);
      batch.set(ref, train);
    }

    await batch.commit();
    total += chunk.length;
    batchIndex++;
    console.log(`  ✅ Batch ${batchIndex}: committed ${chunk.length} trains (total: ${total})`);
  }

  // Write metadata doc
  const metaRef = doc(db, TRAINS_COLLECTION, '_meta');
  await setDoc(metaRef, {
    lastUpdatedAt: serverTimestamp(),
    trainCount: TRAINS.length,
    seededBy: 'seedFirestore.ts',
  });

  console.log(`\n🎉 Done! ${total} trains seeded successfully.`);
  console.log(`   Open Firebase Console to verify: https://console.firebase.google.com/project/money-manager-b394e/firestore\n`);
  process.exit(0);
}

seed().catch((err: any) => {
  console.error('\n❌ Seed failed:', err.message ?? err);

  if (err.code === 'permission-denied' || String(err).includes('PERMISSION_DENIED')) {
    console.error('\n📋 How to fix Firestore permission error:');
    console.error('  Option A (Temporary for seeding):');
    console.error('    1. Open Firebase Console: https://console.firebase.google.com/project/money-manager-b394e/firestore/rules');
    console.error('    2. Change rules to:');
    console.error('         rules_version = \'2\';');
    console.error('         service cloud.firestore {');
    console.error('           match /databases/{database}/documents {');
    console.error('             match /{document=**} { allow read, write: if true; }');
    console.error('           }');
    console.error('         }');
    console.error('    3. Click "Publish". Re-run this script:');
    console.error('         npx ts-node --project tsconfig.seed.json --transpile-only scripts/seedFirestore.ts');
    console.error('    4. After seeding completes, change rules to allow read-only:');
    console.error('         match /trains/{trainId} { allow read: if true; allow write: if false; }');
    console.error('\n  Option B (Using Anonymous Auth):');
    console.error('    1. Open Firebase Console -> Authentication -> Sign-in method:');
    console.error('       https://console.firebase.google.com/project/money-manager-b394e/authentication/providers');
    console.error('    2. Enable "Anonymous" and save.');
    console.error('    3. In Firestore Rules, set:');
    console.error('         match /trains/{trainId} { allow read: if true; allow write: if request.auth != null; }');
  }

  process.exit(1);
});
