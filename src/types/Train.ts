import { TrainStop } from './TrainStop';

export type TrainType = 'Rajdhani' | 'VandeBharat' | 'Tejas' | 'Express' | 'Mail' | 'Passenger' | 'DEMU';

export interface Train {
  id: string;
  trainNumber: string;
  name: string;
  sourceStationCode: string;
  destinationStationCode: string;
  /** 0=Sunday, 1=Monday, ..., 6=Saturday */
  runningDays: number[];
  type: TrainType;
  stops: TrainStop[];
  /**
   * true = fetched from RailRadar API as a special / extra service.
   * These trains are not in the hardcoded dataset; stop-level detail is unavailable.
   */
  isSpecial?: boolean;
  // Fields reserved for future Tatkal & booking integration (V2+):
  // classes?: string[];     // e.g. ['1A', '2A', '3A', 'SL']
  // quotas?: string[];      // e.g. ['GN', 'TQ', 'LD']
  // historicalAvailability?: Record<string, Record<string, number>>;
}
