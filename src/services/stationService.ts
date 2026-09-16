import { Station } from '../types/Station';
import { STATIONS, STATION_MAP } from '../data/stations';

/**
 * Abstract interface for station data access.
 * Swap MockStationService for SupabaseStationService without touching any UI.
 */
export interface IStationService {
  getAllStations(): Promise<Station[]>;
  getStation(code: string): Promise<Station | null>;
  searchStations(query: string): Promise<Station[]>;
}

class MockStationService implements IStationService {
  async getAllStations(): Promise<Station[]> {
    return Promise.resolve(STATIONS);
  }

  async getStation(code: string): Promise<Station | null> {
    return Promise.resolve(STATION_MAP[code] ?? null);
  }

  async searchStations(query: string): Promise<Station[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return STATIONS.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q),
    );
  }
}

/** Singleton service — swap implementation here to switch to API */
export const stationService: IStationService = new MockStationService();
