import { create } from 'zustand';
import { Station } from '../types/Station';
import { RailwayRoute } from '../types/RailwayRoute';
import { routeService } from '../services/routeService';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/** Default region centered on the Konkan/Goa corridor */
export const DEFAULT_REGION: Region = {
  latitude: 16.5,
  longitude: 73.8,
  latitudeDelta: 6.0,
  longitudeDelta: 4.0,
};

interface MapState {
  region: Region;
  selectedStation: Station | null;
  routes: RailwayRoute[];
  showAllTrains: boolean;
  showStationNames: boolean;
  isLoadingRoutes: boolean;

  // Actions
  setRegion: (region: Region) => void;
  selectStation: (station: Station | null) => void;
  loadRoutes: () => Promise<void>;
  focusStation: (station: Station) => void;
  resetToDefault: () => void;
  toggleStationNames: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  region: DEFAULT_REGION,
  selectedStation: null,
  routes: [],
  showAllTrains: true,
  showStationNames: true,
  isLoadingRoutes: false,

  setRegion: (region: Region) => set({ region }),

  selectStation: (station: Station | null) => set({ selectedStation: station }),

  loadRoutes: async () => {
    set({ isLoadingRoutes: true });
    try {
      const routes = await routeService.getAllRoutes();
      set({ routes, isLoadingRoutes: false });
    } catch {
      set({ isLoadingRoutes: false });
    }
  },

  focusStation: (station: Station) => {
    set({
      region: {
        latitude: station.latitude,
        longitude: station.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      },
      selectedStation: station,
    });
  },

  resetToDefault: () => set({ region: DEFAULT_REGION, selectedStation: null }),

  toggleStationNames: () =>
    set(state => ({ showStationNames: !state.showStationNames })),
}));
