export interface TrainStop {
  stationCode: string;
  sequence: number;
  arrivalTime?: string;   // "HH:MM" 24-hour format
  departureTime?: string; // "HH:MM" 24-hour format
  dayOffset: number;      // 0 = departure day, 1 = next day, etc.
  platformNumber?: number;
  haltMinutes?: number;
}
