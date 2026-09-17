import { create } from 'zustand';
import { Train } from '../types/Train';
import { trainService } from '../services/trainService';

export type TrainFilter = 'all' | 'to-goa' | 'from-mumbai' | 'goa-stations';

interface TrainState {
  allTrains: Train[];
  filteredTrains: Train[];
  selectedTrain: Train | null;
  activeFilter: TrainFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTrains: () => Promise<void>;
  setFilter: (filter: TrainFilter) => Promise<void>;
  selectTrain: (train: Train | null) => void;
  searchTrains: (query: string) => Promise<Train[]>;
}

export const useTrainStore = create<TrainState>((set, get) => ({
  allTrains: [],
  filteredTrains: [],
  selectedTrain: null,
  activeFilter: 'all',
  isLoading: false,
  error: null,

  loadTrains: async () => {
    set({ isLoading: true, error: null });
    try {
      const trains = await trainService.getAllTrains();
      set({ allTrains: trains, filteredTrains: trains, isLoading: false });
    } catch (_e) {
      set({ error: 'Failed to load trains', isLoading: false });
    }
  },

  setFilter: async (filter: TrainFilter) => {
    set({ activeFilter: filter, isLoading: true });
    try {
      let trains: Train[];
      switch (filter) {
        case 'to-goa':
          trains = await trainService.getTrainsToGoa();
          break;
        case 'from-mumbai':
          trains = await trainService.getTrainsFromMumbai();
          break;
        case 'goa-stations':
          trains = await trainService.getTrainsAtGoaStations();
          break;
        default:
          trains = get().allTrains;
      }
      set({ filteredTrains: trains, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectTrain: (train: Train | null) => {
    set({ selectedTrain: train });
  },

  searchTrains: async (query: string) => {
    return trainService.searchTrains(query);
  },
}));
