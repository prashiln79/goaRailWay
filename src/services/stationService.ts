import { Station } from '../types/Station';
import { getFirebaseStations } from './firebaseStationService';

export interface IStationService {
  getAllStations(): Promise<Station[]>;
  getStation(code: string): Promise<Station | null>;
  searchStations(query: string): Promise<Station[]>;
}

class StationService implements IStationService {
  private _cachedStations: Station[] | null = null;
  private _stationsMap: Map<string, Station> = new Map();
  private _fetchPromise: Promise<Station[]> | null = null;

  async getAllStations(): Promise<Station[]> {
    if (this._cachedStations) {
      return this._cachedStations;
    }
    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = getFirebaseStations().then((stations) => {
      this._cachedStations = stations;
      this._stationsMap = new Map(stations.map((s) => [s.code, s]));
      return stations;
    });

    return this._fetchPromise;
  }

  async getStation(code: string): Promise<Station | null> {
    await this.getAllStations();
    return this._stationsMap.get(code) ?? null;
  }

  async searchStations(query: string): Promise<Station[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const all = await this.getAllStations();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q),
    );
  }
}

/** Singleton service backed by Firebase Firestore & 7-day cache */
export const stationService: IStationService = new StationService();
