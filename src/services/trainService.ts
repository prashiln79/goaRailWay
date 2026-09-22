import { Train } from '../types/Train';
import { TRAINS, TRAIN_MAP } from '../data/trains';
import { GOA_STATION_CODES, MUMBAI_STATION_CODES } from '../data/stations';
import { ConnectionOption } from '../types/Connection';
import { MOCK_CONNECTIONS } from '../data/connections';
import { getRailRadarCorridorTrains } from './railRadarService';
import { normalizeSpecialTrains, mergeWithHardcoded } from './specialTrainsNormalizer';

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
 * Combined train service:
 * 1. Fetches special trains from RailRadar API (cached weekly)
 * 2. Merges with hardcoded TRAINS list (hardcoded trains take precedence)
 * 3. Falls back silently to hardcoded list if API is unavailable
 */
class TrainService implements ITrainService {
  /** Singleton merged list — resolved once per app session after the first call */
  private _cachedMergedTrains: Train[] | null = null;
  private _fetchPromise: Promise<Train[]> | null = null;

  async getAllTrains(): Promise<Train[]> {
    // Return in-session cache immediately if available
    if (this._cachedMergedTrains) {
      return this._cachedMergedTrains;
    }

    // Deduplicate concurrent calls
    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = (async () => {
      try {
        const rawSpecials = await getRailRadarCorridorTrains();
        const specialTrains = normalizeSpecialTrains(rawSpecials);
        const merged = mergeWithHardcoded(specialTrains);

        if (specialTrains.length > 0) {
          console.log(
            `[TrainService] Loaded ${TRAINS.length} hardcoded + ${specialTrains.length} special trains`,
          );
        }

        this._cachedMergedTrains = merged;
        return merged;
      } catch (err) {
        console.warn('[TrainService] RailRadar fetch failed, using hardcoded data:', err);
        this._cachedMergedTrains = TRAINS;
        return TRAINS;
      }
    })();

    return this._fetchPromise;
  }

  async getTrain(trainNumber: string): Promise<Train | null> {
    // First check hardcoded map for O(1) lookup
    if (TRAIN_MAP[trainNumber]) return TRAIN_MAP[trainNumber];
    // Then check merged list (for specials)
    const all = await this.getAllTrains();
    return all.find(t => t.trainNumber === trainNumber) ?? null;
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
    return Promise.resolve(MOCK_CONNECTIONS);
  }
}

export const trainService: ITrainService = new TrainService();
