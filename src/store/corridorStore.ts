import { create } from 'zustand';
import { CorridorHubId } from '../data/corridorHubs';

interface CorridorState {
  selectedHub: CorridorHubId;
  setSelectedHub: (hub: CorridorHubId) => void;
}

export const useCorridorStore = create<CorridorState>(set => ({
  selectedHub: 'Goa',
  setSelectedHub: (hub: CorridorHubId) => set({ selectedHub: hub }),
}));
