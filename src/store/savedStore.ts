import { create } from 'zustand';
import { SavedRoute, SavedTrain, SavedConnection } from '../types/Connection';

interface SavedState {
  savedRoutes: SavedRoute[];
  savedTrains: SavedTrain[];
  savedConnections: SavedConnection[];

  // Trains
  toggleTrainFavorite: (trainNumber: string) => void;
  isTrainSaved: (trainNumber: string) => boolean;

  // Routes (kept for future use, not shown in Saved tab)
  toggleRouteFavorite: (fromStationCode: string, toStationCode: string, label?: string) => void;
  isRouteSaved: (fromStationCode: string, toStationCode: string) => boolean;

  // Connections
  toggleConnectionFavorite: (id: string, title: string, fromCode: string, toCode: string, viaCode: string) => void;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  // Seed data — only truly favorited trains are pre-seeded
  savedRoutes: [],

  savedTrains: [
    {
      id: 'st-1',
      trainNumber: '12619',
      isFavorite: true,
    },
  ],

  savedConnections: [],

  // ─── Trains ────────────────────────────────────────────────────────
  toggleTrainFavorite: (trainNumber) => {
    const { savedTrains } = get();
    const existing = savedTrains.find(t => t.trainNumber === trainNumber);
    if (existing) {
      // Already saved → unsave (remove entirely)
      set({ savedTrains: savedTrains.filter(t => t.trainNumber !== trainNumber) });
    } else {
      // Not saved → save
      set({
        savedTrains: [
          ...savedTrains,
          {
            id: `st-${Date.now()}`,
            trainNumber,
            isFavorite: true,
          },
        ],
      });
    }
  },

  isTrainSaved: (trainNumber) => {
    return get().savedTrains.some(t => t.trainNumber === trainNumber);
  },

  // ─── Routes ────────────────────────────────────────────────────────
  toggleRouteFavorite: (fromStationCode, toStationCode, label) => {
    const { savedRoutes } = get();
    const existing = savedRoutes.find(
      r => r.fromStationCode === fromStationCode && r.toStationCode === toStationCode,
    );
    if (existing) {
      set({ savedRoutes: savedRoutes.filter(r => r.id !== existing.id) });
    } else {
      set({
        savedRoutes: [
          ...savedRoutes,
          {
            id: `sr-${Date.now()}`,
            fromStationCode,
            toStationCode,
            isFavorite: true,
            label,
          },
        ],
      });
    }
  },

  isRouteSaved: (fromCode, toCode) => {
    return get().savedRoutes.some(
      r => r.fromStationCode === fromCode && r.toStationCode === toCode,
    );
  },

  // ─── Connections ───────────────────────────────────────────────────
  toggleConnectionFavorite: (id, title, fromCode, toCode, viaCode) => {
    const { savedConnections } = get();
    const existing = savedConnections.find(c => c.id === id);
    if (existing) {
      set({ savedConnections: savedConnections.filter(c => c.id !== id) });
    } else {
      set({
        savedConnections: [
          ...savedConnections,
          {
            id,
            title,
            fromStationCode: fromCode,
            toStationCode: toCode,
            viaStationCode: viaCode,
            train1Number: '',
            train2Number: '',
            isFavorite: true,
          },
        ],
      });
    }
  },
}));
