import { Train } from './Train';
import { ConnectionOption } from './Connection';

export type DestinationArea = 'GOA_NORTH' | 'GOA_SOUTH' | 'GOA_CENTRAL' | 'GOA_ALL' | 'SPECIFIC_STATION';

export interface StationOption {
  code: string;
  name: string;
  state?: string;
  isArea?: boolean;
  areaType?: DestinationArea;
  subtitle?: string;
}

export interface JourneyResultItem {
  id: string;
  type: 'direct' | 'connection';
  train?: Train;
  connection?: ConnectionOption;
  // Origin & Destination metadata for this specific result option
  fromStationCode: string;
  toStationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  dayOffset: number;
  destinationType: 'GOA' | 'NEARBY';
  distanceLabel?: string;     // e.g. "38 km from North Goa"
  alternativeFor?: string;    // e.g. "Alternative for North Goa"
  roadTravelTip?: string;     // e.g. "Continue to North Goa by road"
}
