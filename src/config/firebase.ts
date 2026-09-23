/**
 * Firebase Configuration
 *
 * Central Firebase initialisation. Import `db` and `auth` from here in all
 * services that need Firestore or Auth access. Initialised only once (singleton).
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCbi9w0M2U4jtO6tkf78SHvXrgvL4TbyqI',
  authDomain: 'money-manager-b394e.firebaseapp.com',
  projectId: 'money-manager-b394e',
  storageBucket: 'money-manager-b394e.firebasestorage.app',
  messagingSenderId: '844099376199',
  appId: '1:844099376199:web:d778d53279e65258b48d62',
  measurementId: 'G-G75KP504VD',
};

// Prevent duplicate initialisation (e.g. fast-refresh in Expo Go)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
