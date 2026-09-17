export interface AvailabilityItem {
  trainClass: '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S';
  generalStatus: string; // e.g., 'WL 12', 'Available', 'RAC 8'
  tatkalStatus: string;  // e.g., 'WL 4', 'RAC 8', 'Available'
  statusSummary: 'High demand' | 'Available' | 'Try Tatkal' | 'Good chance' | 'Regret';
}

export interface ConnectionSegment {
  trainNumber: string;
  trainName: string;
  trainType: string;
  fromStationCode: string;
  toStationCode: string;
  departureTime: string;
  arrivalTime: string;
  dayOffset: number;
  duration: string;
  availabilitySample?: string;
}

export interface ConnectionOption {
  id: string;
  type: 'direct' | 'connecting';
  tag?: string; // 'Best Option', 'Often better chances in Tatkal', etc.
  fromStationCode: string;
  toStationCode: string;
  totalDuration: string;
  connectionTime?: string;
  connectionStationCode?: string;
  segments: ConnectionSegment[];
  note?: string;
}

export interface SavedRoute {
  id: string;
  fromStationCode: string;
  toStationCode: string;
  isFavorite: boolean;
  label?: string;
}

export interface SavedTrain {
  id: string;
  trainNumber: string;
  isFavorite: boolean;
}

export interface SavedConnection {
  id: string;
  title: string;
  fromStationCode: string;
  toStationCode: string;
  viaStationCode: string;
  train1Number: string;
  train2Number: string;
  isFavorite: boolean;
}
