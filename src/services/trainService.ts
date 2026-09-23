import { Train } from '../types/Train';
import { GOA_STATION_CODES, MUMBAI_STATION_CODES } from '../data/stations';
import { ConnectionOption } from '../types/Connection';
import { getFirebaseTrains } from './firebaseTrainService';
import { getFirebaseConnections } from './firebaseConnectionService';

export interface ITrainService {
  getAllTrains(): Promise<Train[]>;
  getTrain(trainNumber: string): Promise<Train | null>;
  getTrainsAtStation(stationCode: string): Promise<Train[]>;
  getTrainsToGoa(): Promise<Train[]>;
  getTrainsFromMumbai(): Promise<Train[]>;
  getTrainsAtGoaStations(): Promise<Train[]>;
  searchTrains(query: string): Promise<Train[]>;
  getConnections(fromCode: string, toCode: string, date?: string): Promise<ConnectionOption[]>;
}

/**
 * Train service backed by Firebase Firestore.
 *
 * Data flow:
 *   1. On first call, fetches all trains from Firestore (cached 7 days in AsyncStorage).
 *   2. On cache hit, returns instantly with zero network calls.
 *
 * To refresh Firestore data, run:
 *   npx ts-node --project tsconfig.seed.json scripts/seedAllFirestore.ts
 */
class TrainService implements ITrainService {
  /** In-session memory cache — resolved once per app session */
  private _cachedTrains: Train[] | null = null;
  private _trainsMap: Map<string, Train> = new Map();
  private _fetchPromise: Promise<Train[]> | null = null;

  async getAllTrains(): Promise<Train[]> {
    // Return in-session cache immediately if available
    if (this._cachedTrains) {
      return this._cachedTrains;
    }

    // Deduplicate concurrent calls
    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = getFirebaseTrains().then((trains) => {
      this._cachedTrains = trains;
      this._trainsMap = new Map(trains.map((t) => [t.trainNumber, t]));
      return trains;
    });

    return this._fetchPromise;
  }

  async getTrain(trainNumber: string): Promise<Train | null> {
    await this.getAllTrains();
    return this._trainsMap.get(trainNumber) ?? null;
  }

  async getTrainsAtStation(stationCode: string): Promise<Train[]> {
    const all = await this.getAllTrains();
    return all.filter(t => t.stops.some(s => s.stationCode === stationCode));
  }

  /** Trains whose route contains at least one Goa station */
  async getTrainsToGoa(): Promise<Train[]> {
    const all = await this.getAllTrains();
    return all.filter(t => t.stops.some(s => GOA_STATION_CODES.has(s.stationCode)));
  }

  /** Trains originating from a Mumbai-area station */
  async getTrainsFromMumbai(): Promise<Train[]> {
    const all = await this.getAllTrains();
    return all.filter(t => MUMBAI_STATION_CODES.has(t.sourceStationCode));
  }

  /** Trains stopping at any Goa station */
  async getTrainsAtGoaStations(): Promise<Train[]> {
    return this.getTrainsToGoa();
  }

  async searchTrains(query: string): Promise<Train[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const all = await this.getAllTrains();
    return all.filter(
      t =>
        t.trainNumber.includes(q) ||
        t.name.toLowerCase().includes(q),
    );
  }

  async getConnections(
    _fromCode: string,
    _toCode: string,
    _date?: string,
  ): Promise<ConnectionOption[]> {
    return getFirebaseConnections();
  }
}

export const trainService: ITrainService = new TrainService();
