export interface GoaStationInfo {
  code: string;
  name: string;
  region: 'North Goa' | 'Central Goa' | 'South Goa';
  tagline?: string;
  nearbyDestinations?: string;
  roadAccess?: string;
}

export interface MumbaiStationInfo {
  code: string;
  name: string;
  area: string;
  type: 'Terminus' | 'Junction' | 'Transit Hub';
  tagline: string;
  nearbyDestinations?: string;
  transitAccess?: string;
}

export interface NearbyAlternativeStationInfo {
  code: string;
  name: string;
  state: string;
  distanceKm: number;
  distanceLabel: string; // e.g., '38 km from North Goa'
  usefulRegion: 'North Goa' | 'South Goa';
  alternativeFor: string; // e.g., 'Alternative for North Goa'
  group: 'NEARBY FOR NORTH GOA' | 'NEARBY FOR SOUTH GOA';
  roadTravelTime?: string;
  roadTip?: string;
}

export const GOA_STATIONS_DATA: GoaStationInfo[] = [
  {
    code: 'THVM',
    name: 'Thivim',
    region: 'North Goa',
    tagline: 'Main rail gateway for North Goa beaches and towns',
    nearbyDestinations: 'Mapusa (10 km), Calangute (18 km), Baga (19 km), Anjuna (21 km), Panaji (23 km)',
    roadAccess: 'Readily available pre-paid taxis, auto rickshaws, and frequent Kadamba buses to Mapusa & Panaji.',
  },
  {
    code: 'KRMI',
    name: 'Karmali',
    region: 'Central Goa',
    tagline: 'Closest railhead to capital Panaji and Old Goa churches',
    nearbyDestinations: 'Old Goa (3 km), Panaji (12 km), Miramar (15 km), Dona Paula (18 km)',
    roadAccess: 'Quick 20-minute taxi or bus ride along NH748 directly into Panaji central.',
  },
  {
    code: 'MAO',
    name: 'Madgaon',
    region: 'South Goa',
    tagline: 'Largest junction in Goa, connecting Konkan Railway with South Western Railway',
    nearbyDestinations: 'Colva (8 km), Benaulim (10 km), Palolem (36 km), Margao city (2 km)',
    roadAccess: 'Extensive pre-paid taxi booths, state transport terminal right outside, and auto stands.',
  },
  {
    code: 'CNO',
    name: 'Canacona',
    region: 'South Goa',
    tagline: 'Peaceful coastal station for southernmost Goa beach destinations',
    nearbyDestinations: 'Palolem Beach (3 km), Patnem (4 km), Agonda (9 km), Galgibaga (7 km)',
    roadAccess: 'Local auto rickshaws and taxis to Palolem and Patnem beaches in under 10 minutes.',
  },
  {
    code: 'VSG',
    name: 'Vasco da Gama',
    region: 'South Goa',
    tagline: 'Terminus station close to Dabolim Airport and port city',
    nearbyDestinations: 'Dabolim Airport (4 km), Bogmalo Beach (8 km), Baina Beach (2 km)',
    roadAccess: 'Direct city taxi service and local city buses connecting to airport and Margao.',
  },
];

export const NEARBY_ALTERNATIVE_STATIONS_DATA: NearbyAlternativeStationInfo[] = [
  {
    code: 'SWV',
    name: 'Sawantwadi Road',
    state: 'Maharashtra',
    distanceKm: 38,
    distanceLabel: '38 km from North Goa',
    usefulRegion: 'North Goa',
    alternativeFor: 'Alternative for North Goa',
    group: 'NEARBY FOR NORTH GOA',
    roadTravelTime: '~50 min by road',
    roadTip: 'Useful alternative for North Goa via road or bus connection.',
  },

  {
    code: 'KKW',
    name: 'Kankavli',
    state: 'Maharashtra',
    distanceKm: 67,
    distanceLabel: '67 km from North Goa',
    usefulRegion: 'North Goa',
    alternativeFor: 'Alternative for North Goa',
    group: 'NEARBY FOR NORTH GOA',
    roadTravelTime: '~1h 30m by road',
    roadTip: 'Useful backup station with road connections toward Goa.',
  },

  {
    code: 'KUDL',
    name: 'Kudal',
    state: 'Maharashtra',
    distanceKm: 60,
    distanceLabel: '60 km from Thivim',
    usefulRegion: 'North Goa',
    alternativeFor: 'Alternative for North Goa',
    group: 'NEARBY FOR NORTH GOA',
    roadTravelTime: '~1h by road',
    roadTip: 'Good alternative when Thivim availability is limited.',
  },

  {
    code: 'LD',
    name: 'Londa Junction',
    state: 'Karnataka',
    distanceKm: 88,
    distanceLabel: '88 km from North Goa',
    usefulRegion: 'North Goa',
    alternativeFor: 'Alternative for North Goa',
    group: 'NEARBY FOR NORTH GOA',
    roadTravelTime: '~1h 30m by road',
    roadTip: 'Major junction with road/bus connectivity toward North Goa.',
  },

  {
    code: 'BGM',
    name: 'Belagavi',
    state: 'Karnataka',
    distanceKm: 92,
    distanceLabel: '92 km from North Goa',
    usefulRegion: 'North Goa',
    alternativeFor: 'Alternative for North Goa',
    group: 'NEARBY FOR NORTH GOA',
    roadTravelTime: '~1h 25m by road',
    roadTip: 'Useful backup station with bus and taxi connections to North Goa.',
  },

  {
    code: 'KAWR',
    name: 'Karwar',
    state: 'Karnataka',
    distanceKm: 34,
    distanceLabel: '34 km from South Goa',
    usefulRegion: 'South Goa',
    alternativeFor: 'Alternative for South Goa',
    group: 'NEARBY FOR SOUTH GOA',
    roadTravelTime: '~45 min by road',
    roadTip: 'Useful alternative for South Goa via road or bus connection.',
  },
];

export const MUMBAI_STATIONS_DATA: MumbaiStationInfo[] = [
  {
    code: 'CSMT',
    name: 'Mumbai CSMT',
    area: 'South Mumbai',
    type: 'Terminus',
    tagline: 'UNESCO World Heritage terminus; originating hub for Konkan Kanya, Mandovi, Tejas & Vande Bharat',
    nearbyDestinations: 'Colaba, Fort, Marine Drive, Nariman Point, Churchgate',
    transitAccess: 'Direct terminus for Central & Harbour suburban local trains, pre-paid taxis, BEST bus hub outside.',
  },
  {
    code: 'LTT',
    name: 'Mumbai LTT',
    area: 'Kurla / Central Suburbs',
    type: 'Terminus',
    tagline: 'Major terminus for southern & Konkan trains including Matsyagandha and Netravati Express',
    nearbyDestinations: 'Bandra-Kurla Complex (BKC), Chembur, Ghatkopar, Mumbai Airport (8 km)',
    transitAccess: 'Connected via auto rickshaws, app cabs, and suburban connection via Tilak Nagar & Kurla stations.',
  },
  {
    code: 'DR',
    name: 'Dadar',
    area: 'Central Mumbai',
    type: 'Transit Hub',
    tagline: 'Premier interchange linking Central & Western railway lines; origin for Tutari Express',
    nearbyDestinations: 'Shivaji Park, Prabhadevi, Matunga, Worli, Lower Parel',
    transitAccess: 'Fast trains on both Western & Central lines, shared cabs, direct road access via Eastern & Western Expressways.',
  },
  {
    code: 'PNVL',
    name: 'Panvel',
    area: 'Navi Mumbai',
    type: 'Junction',
    tagline: 'Universal gateway junction where ALL Konkan corridor trains halt; ideal for Navi Mumbai & Pune',
    nearbyDestinations: 'Navi Mumbai, Kharghar, Belapur, Vashi, Pune Expressway link',
    transitAccess: 'Harbour Line local trains, direct state buses to Pune & Western Maharashtra, NH48/Mumbai-Pune Expressway.',
  },
  {
    code: 'DIV',
    name: 'Diva',
    area: 'Thane District',
    type: 'Junction',
    tagline: 'Central line junction connecting suburban network to Roha and Konkan passenger services',
    nearbyDestinations: 'Dombivli, Kalyan, Thane, Mumbra',
    transitAccess: 'Central railway slow & fast local trains, local shared autos.',
  },
];
