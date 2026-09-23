/**
 * Auth Service — Anonymous Sign-In
 *
 * Signs the user in anonymously so every Firebase request carries a real UID.
 * The app stays completely login-free — no screens, no prompts.
 *
 * How it works:
 *   - Firebase Auth persists the anonymous session automatically across app restarts.
 *   - On first launch: a new anonymous UID is created and stored by Firebase.
 *   - On subsequent launches: the same UID is restored from Firebase's persistence layer.
 *   - `ensureSignedIn()` is safe to call multiple times — it's a no-op if already signed in.
 *
 * Benefits over public read rules:
 *   - Each device gets a unique, stable Firebase UID.
 *   - Firestore rules can scope reads/writes to `request.auth != null`.
 *   - Ready to upgrade: if you ever add real auth, the anonymous account can be linked
 *     to a real provider (email, Google, etc.) without losing data.
 */

import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

// ─── Internal state ───────────────────────────────────────────────────────────

let _currentUser: User | null = null;
let _signInPromise: Promise<User> | null = null;

// Mirror auth state changes so we always have the latest user in memory
onAuthStateChanged(auth, (user) => {
  _currentUser = user;
});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Ensures the user is signed in anonymously.
 * Returns the current Firebase User.
 *
 * Safe to call multiple times — reuses the in-progress sign-in if called
 * concurrently (e.g. from multiple services initialising at the same time).
 */
export async function ensureSignedIn(): Promise<User> {
  // Already signed in
  if (_currentUser) {
    return _currentUser;
  }

  // Deduplicate concurrent calls
  if (_signInPromise) {
    return _signInPromise;
  }

  _signInPromise = (async () => {
    try {
      const credential = await signInAnonymously(auth);
      _currentUser = credential.user;
      console.log(`[AuthService] Signed in anonymously — UID: ${credential.user.uid}`);
      return credential.user;
    } catch (err) {
      console.warn('[AuthService] Anonymous sign-in failed:', err);
      throw err;
    } finally {
      _signInPromise = null;
    }
  })();

  return _signInPromise;
}

/** Returns the current Firebase UID, or null if not yet signed in. */
export function getCurrentUid(): string | null {
  return _currentUser?.uid ?? null;
}
