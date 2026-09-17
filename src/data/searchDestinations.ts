/**
 * Canonical destination list for the Goa train search engine.
 * Stored once here — TrainsHomeScreen reads these to determine which stops
 * to match against for each train in the flatMap search.
 */
export interface SearchDestination {
  code: string;
  name: string;
  type: 'GOA' | 'NEARBY';
  region: string;
  distanceKm?: number;
  alternativeFor?: string;
  roadTip?: string;
}

/** All Goa stations */
export const GOA_DESTINATIONS: SearchDestination[] = [
  { code: 'THVM', name: 'Thivim',        type: 'GOA', region: 'North Goa' },
  { code: 'PER',  name: 'Pernem',        type: 'GOA', region: 'North Goa' },
  { code: 'KRMI', name: 'Karmali',       type: 'GOA', region: 'Central Goa' },
  { code: 'MAO',  name: 'Madgaon',       type: 'GOA', region: 'South Goa' },
  { code: 'CNO',  name: 'Canacona',      type: 'GOA', region: 'South Goa' },
  { code: 'VSG',  name: 'Vasco da Gama', type: 'GOA', region: 'South Goa' },
];

/** Nearby alternative stations (Maharashtra / Karnataka) */
export const NEARBY_DESTINATIONS: SearchDestination[] = [
  {
    code: 'SWV',
    name: 'Sawantwadi Road',
    type: 'NEARBY',
    region: 'North Goa',
    distanceKm: 38,
    alternativeFor: 'North Goa',
    roadTip: 'Continue to North Goa by road (~50 min)',
  },
  {
    code: 'KUDL',
    name: 'Kudal',
    type: 'NEARBY',
    region: 'North Goa',
    distanceKm: 60,
    alternativeFor: 'North Goa',
    roadTip: 'Continue to North Goa by road (~1 hr)',
  },
  {
    code: 'KKW',
    name: 'Kankavli',
    type: 'NEARBY',
    region: 'North Goa',
    distanceKm: 75,
    alternativeFor: 'North Goa',
    roadTip: 'Continue to North Goa by road (~1.5 hrs)',
  },
  {
    code: 'KAWR',
    name: 'Karwar',
    type: 'NEARBY',
    region: 'South Goa',
    distanceKm: 34,
    alternativeFor: 'South Goa',
    roadTip: 'Continue to South Goa by road (~45 min)',
  },
];

/**
 * Full combined list — all Goa and nearby stations.
 * This is the user-specified KONKAN_SEARCH_DESTINATIONS export.
 */
export const KONKAN_SEARCH_DESTINATIONS: SearchDestination[] = [
  ...GOA_DESTINATIONS,
  ...NEARBY_DESTINATIONS,
];

/** Helper: returns candidate destinations for a given user selection */
export function getDestinationsForSelection(params: {
  isArea?: boolean;
  areaType?: string;
  code?: string;
}): SearchDestination[] {
  if (!params.isArea) {
    // Specific station selected
    return KONKAN_SEARCH_DESTINATIONS.filter(d => d.code === params.code);
  }

  switch (params.areaType) {
    case 'GOA_NORTH':
      return [
        ...GOA_DESTINATIONS.filter(d => d.region === 'North Goa'),
        ...NEARBY_DESTINATIONS.filter(d => d.alternativeFor === 'North Goa'),
      ];
    case 'GOA_SOUTH':
      return [
        ...GOA_DESTINATIONS.filter(d => d.region === 'South Goa' || d.region === 'Central Goa'),
        ...NEARBY_DESTINATIONS.filter(d => d.alternativeFor === 'South Goa'),
      ];
    case 'GOA_ALL':
    default:
      return KONKAN_SEARCH_DESTINATIONS;
  }
}
