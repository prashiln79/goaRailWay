import { Ionicons } from '@expo/vector-icons';

export type CorridorHubId = 'Goa' | 'Sawantwadi' | 'Ratnagiri' | 'Mumbai';

export interface HubStation {
  code: string;
  name: string;
  shortName: string;
  tag?: string;
}

export interface CorridorHub {
  id: CorridorHubId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  stations: HubStation[];
}

export const CORRIDOR_HUBS: CorridorHub[] = [
  {
    id: 'Goa',
    label: 'Goa',
    icon: 'sunny-outline',
    description: 'Stations across North, Central & South Goa',
    stations: [
      { code: 'ALL_GOA', name: 'All Goa & Nearby', shortName: 'All (+ Nearby)' },
      { code: 'THVM', name: 'Thivim', shortName: 'Thivim', tag: 'North' },
      { code: 'KRMI', name: 'Karmali', shortName: 'Karmali', tag: 'Panaji' },
      { code: 'MAO', name: 'Madgaon', shortName: 'Madgaon', tag: 'South' },
      { code: 'CNO', name: 'Canacona', shortName: 'Canacona', tag: 'South' },
      { code: 'VSG', name: 'Vasco da Gama', shortName: 'Vasco', tag: 'Port' },
      { code: 'PER', name: 'Pernem', shortName: 'Pernem', tag: 'North' },
      { code: 'SWV', name: 'Sawantwadi Road', shortName: 'Sawantwadi', tag: '38 km' },
      { code: 'KUDL', name: 'Kudal', shortName: 'Kudal', tag: '60 km' },
      { code: 'KAWR', name: 'Karwar', shortName: 'Karwar', tag: '34 km' },
    ],
  },
  {
    id: 'Mumbai',
    label: 'Mumbai',
    icon: 'business-outline',
    description: 'Mumbai metropolitan originating & terminating hubs',
    stations: [
      { code: 'ALL_MUMBAI', name: 'All Mumbai Hubs', shortName: 'All' },
      { code: 'CSMT', name: 'Mumbai CSMT', shortName: 'CSMT', tag: 'South' },
      { code: 'LTT', name: 'Mumbai LTT', shortName: 'LTT', tag: 'Kurla' },
      { code: 'DR', name: 'Dadar', shortName: 'Dadar', tag: 'Central' },
      { code: 'PNVL', name: 'Panvel', shortName: 'Panvel', tag: 'Navi Mumbai' },
      { code: 'DIV', name: 'Diva', shortName: 'Diva', tag: 'Central' },
    ],
  },
];

// Preserved for future expansion (Sindhudurg & Central Konkan)
export const EXTENDED_CORRIDOR_HUBS: CorridorHub[] = [
  {
    id: 'Sawantwadi',
    label: 'Sawantwadi',
    icon: 'location-outline',
    description: 'Sindhudurg district & Goa border alternatives',
    stations: [
      { code: 'ALL_SWV', name: 'All Sindhudurg', shortName: 'All' },
      { code: 'SWV', name: 'Sawantwadi Road', shortName: 'Sawantwadi Rd', tag: '38 km to Goa' },
      { code: 'KUDL', name: 'Kudal', shortName: 'Kudal', tag: '60 km to Goa' },
      { code: 'KKW', name: 'Kankavli', shortName: 'Kankavli', tag: '75 km to Goa' },
    ],
  },
  {
    id: 'Ratnagiri',
    label: 'Ratnagiri',
    icon: 'boat-outline',
    description: 'Central Konkan junctions & coastal towns',
    stations: [
      { code: 'ALL_RN', name: 'All Central Konkan', shortName: 'All' },
      { code: 'RN', name: 'Ratnagiri', shortName: 'Ratnagiri', tag: 'Junction' },
      { code: 'CHI', name: 'Chiplun', shortName: 'Chiplun', tag: 'North Konkan' },
      { code: 'ROHA', name: 'Roha', shortName: 'Roha', tag: 'Junction' },
    ],
  },
];

export const GOA_STATION_CODES = new Set(['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG']);
export const NEARBY_GOA_STATION_CODES = new Set(['SWV', 'KUDL', 'KKW', 'KAWR']);
export const GOA_AND_NEARBY_CODES = new Set([
  ...Array.from(GOA_STATION_CODES),
  ...Array.from(NEARBY_GOA_STATION_CODES),
]);

export const SWV_STATION_CODES = new Set(['SWV', 'KUDL', 'KKW']);
export const RN_STATION_CODES = new Set(['RN', 'CHI', 'ROHA', 'MNDA']);
export const MUMBAI_STATION_CODES = new Set(['CSMT', 'LTT', 'DR', 'PNVL', 'DIV', 'BCT', 'BDTS']);

// All mid-Konkan codes used for direction detection
export const KONKAN_CODES = new Set([
  ...Array.from(GOA_STATION_CODES),
  ...Array.from(SWV_STATION_CODES),
  ...Array.from(RN_STATION_CODES),
]);
