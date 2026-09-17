import { Train } from '../types/Train';
import { TRAINS, TRAIN_MAP } from '../data/trains';
import { GOA_STATION_CODES, MUMBAI_STATION_CODES } from '../data/stations';
import { AvailabilityItem, ConnectionOption } from '../types/Connection';
import { MOCK_AVAILABILITY, MOCK_CONNECTIONS } from '../data/connections';

export interface ITrainService {
  getAllTrains(): Promise<Train[]>;
  getTrain(trainNumber: string): Promise<Train | null>;
  getTrainsAtStation(stationCode: string): Promise<Train[]>;
  getTrainsToGoa(): Promise<Train[]>;
  getTrainsFromMumbai(): Promise<Train[]>;
  getTrainsAtGoaStations(): Promise<Train[]>;
  searchTrains(query: string): Promise<Train[]>;
  getTrainAvailability(trainNumber: string, date?: string): Promise<AvailabilityItem[]>;
  getConnections(fromCode: string, toCode: string, date?: string): Promise<ConnectionOption[]>;
}

class MockTrainService implements ITrainService {
  async getAllTrains(): Promise<Train[]> {
    return Promise.resolve(TRAINS);
  }

  async getTrain(trainNumber: string): Promise<Train | null> {
    return Promise.resolve(TRAIN_MAP[trainNumber] ?? null);
  }

  async getTrainsAtStation(stationCode: string): Promise<Train[]> {
    return TRAINS.filter(t =>
      t.stops.some(s => s.stationCode === stationCode),
    );
  }

  /** Trains whose route contains at least one Goa station */
  async getTrainsToGoa(): Promise<Train[]> {
    return TRAINS.filter(t =>
      t.stops.some(s => GOA_STATION_CODES.has(s.stationCode)),
    );
  }

  /** Trains originating from a Mumbai-area station */
  async getTrainsFromMumbai(): Promise<Train[]> {
    return TRAINS.filter(t => MUMBAI_STATION_CODES.has(t.sourceStationCode));
  }

  /** Trains stopping at any Goa station */
  async getTrainsAtGoaStations(): Promise<Train[]> {
    return this.getTrainsToGoa();
  }

  async searchTrains(query: string): Promise<Train[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return TRAINS.filter(
      t =>
        t.trainNumber.includes(q) ||
        t.name.toLowerCase().includes(q),
    );
  }

  async getTrainAvailability(trainNumber: string, _date?: string): Promise<AvailabilityItem[]> {
    return Promise.resolve(MOCK_AVAILABILITY[trainNumber] ?? MOCK_AVAILABILITY.default);
  }

  async getConnections(_fromCode: string, _toCode: string, _date?: string): Promise<ConnectionOption[]> {
    return Promise.resolve(MOCK_CONNECTIONS);
  }
}

export const trainService: ITrainService = new MockTrainService();

