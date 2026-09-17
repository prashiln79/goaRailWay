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
}

export interface ConnectionOption {
  id: string;
  type: 'direct' | 'connecting';
  tag?: string;
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
