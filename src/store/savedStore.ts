import { create } from 'zustand';
import { SavedRoute, SavedTrain, SavedConnection } from '../types/Connection';

interface SavedState {
  savedRoutes: SavedRoute[];
  savedTrains: SavedTrain[];
  savedConnections: SavedConnection[];

  toggleRouteFavorite: (fromStationCode: string, toStationCode: string, label?: string) => void;
  toggleTrainFavorite: (trainNumber: string) => void;
  toggleConnectionFavorite: (id: string, title: string, fromCode: string, toCode: string, viaCode: string) => void;
  isRouteSaved: (fromStationCode: string, toStationCode: string) => boolean;
  isTrainSaved: (trainNumber: string) => boolean;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  savedRoutes: [
    {
      id: 'sr-1',
      fromStationCode: 'LTT',
      toStationCode: 'THVM',
      isFavorite: true,
      label: 'Frequently used',
    },
    {
      id: 'sr-2',
      fromStationCode: 'CSMT',
      toStationCode: 'MAO',
      isFavorite: false,
      label: 'Holiday trip',
    },
    {
      id: 'sr-3',
      fromStationCode: 'PNVL',
      toStationCode: 'MAO',
      isFavorite: false,
    },
  ],
  savedTrains: [
    {
      id: 'st-1',
      trainNumber: '12619',
      isFavorite: true,
    },
    {
      id: 'st-2',
      trainNumber: '10103',
      isFavorite: false,
    },
  ],
  savedConnections: [
    {
      id: 'sc-1',
      title: 'Mumbai → Ratnagiri → Thivim',
      fromStationCode: 'LTT',
      toStationCode: 'THVM',
      viaStationCode: 'RN',
      train1Number: '12619',
      train2Number: '50104',
      isFavorite: true,
    },
  ],

  toggleRouteFavorite: (fromStationCode, toStationCode, label) => {
    const { savedRoutes } = get();
    const existing = savedRoutes.find(
      r => r.fromStationCode === fromStationCode && r.toStationCode === toStationCode,
    );
    if (existing) {
      set({
        savedRoutes: savedRoutes.filter(r => r.id !== existing.id),
      });
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

  toggleTrainFavorite: (trainNumber) => {
    const { savedTrains } = get();
    const existing = savedTrains.find(t => t.trainNumber === trainNumber);
    if (existing) {
      set({
        savedTrains: savedTrains.filter(t => t.trainNumber !== trainNumber),
      });
    } else {
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

  toggleConnectionFavorite: (id, title, fromCode, toCode, viaCode) => {
    const { savedConnections } = get();
    const existing = savedConnections.find(c => c.id === id);
    if (existing) {
      set({
        savedConnections: savedConnections.filter(c => c.id !== id),
      });
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
            train1Number: '12619',
            train2Number: '50104',
            isFavorite: true,
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

  isTrainSaved: (trainNumber) => {
    return get().savedTrains.some(t => t.trainNumber === trainNumber);
  },
}));
