import { ConnectionOption } from '../types/Connection';

/**
 * Connecting train options are loaded dynamically from Firebase Firestore.
 * Master seed dataset is preserved in `scripts/seedData/connections.ts`.
 */
export const MOCK_CONNECTIONS: ConnectionOption[] = [];
