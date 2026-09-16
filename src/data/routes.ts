import { RailwayRoute } from '../types/RailwayRoute';

/**
 * Konkan Railway corridor polyline waypoints.
 * These follow the actual coastal alignment through tunnels and ghats.
 * Coordinates sourced from geographic study of the Konkan Railway route.
 * Replace these with survey-accurate GeoJSON data when available.
 */
export const RAILWAY_ROUTES: RailwayRoute[] = [
  {
    id: 'konkan-main',
    name: 'Konkan Main Line',
    lineType: 'main',
    color: '#1A73E8',
    coordinates: [
      // Mumbai CSMT area
      { latitude: 18.9402, longitude: 72.8353 },
      // Mumbai LTT
      { latitude: 19.0748, longitude: 72.8963 },
      // Approaching Panvel
      { latitude: 19.0500, longitude: 72.9500 },
      { latitude: 19.0200, longitude: 73.0200 },
      // Panvel
      { latitude: 18.9944, longitude: 73.1116 },
      // Roha
      { latitude: 18.4427, longitude: 73.1210 },
      // Mangaon
      { latitude: 18.2333, longitude: 73.2833 },
      // Khed
      { latitude: 17.7167, longitude: 73.3833 },
      // Chiplun
      { latitude: 17.5333, longitude: 73.5167 },
      // Ratnagiri approach
      { latitude: 17.2500, longitude: 73.4000 },
      // Ratnagiri
      { latitude: 16.9833, longitude: 73.3000 },
      // Sangameshwar / Adavali area
      { latitude: 16.7167, longitude: 73.5167 },
      // Bandal
      { latitude: 16.5833, longitude: 73.6333 },
      // Vaibhavwadi area
      { latitude: 16.3833, longitude: 73.6667 },
      // Kankavli
      { latitude: 16.1167, longitude: 73.7167 },
      // Kudal
      { latitude: 16.0167, longitude: 73.6833 },
      // Sawantwadi Road
      { latitude: 15.9167, longitude: 73.8167 },
      // Pernem (Goa border)
      { latitude: 15.7250, longitude: 73.7950 },
      // Thivim
      { latitude: 15.5833, longitude: 73.8167 },
      // Karmali
      { latitude: 15.4833, longitude: 73.9167 },
      // Madgaon Junction
      { latitude: 15.2993, longitude: 73.9590 },
      // Canacona
      { latitude: 14.9960, longitude: 74.0400 },
      // Karwar
      { latitude: 14.8167, longitude: 74.1333 },
      // Ankola
      { latitude: 14.6611, longitude: 74.3011 },
      // Gokarna Road
      { latitude: 14.5333, longitude: 74.3833 },
      // Kumta
      { latitude: 14.4267, longitude: 74.4153 },
      // Honnavar
      { latitude: 14.2792, longitude: 74.4456 },
      // Bhatkal
      { latitude: 13.9750, longitude: 74.5583 },
      // Murdeshwar
      { latitude: 14.0933, longitude: 74.4436 },
      // Udupi
      { latitude: 13.3333, longitude: 74.7500 },
      // Mangaluru Central
      { latitude: 12.8708, longitude: 74.8431 },
    ],
  },
  {
    id: 'goa-branch-vasco',
    name: 'Goa Branch — Madgaon to Vasco da Gama',
    lineType: 'branch',
    color: '#0F9D58',
    coordinates: [
      // Madgaon Junction
      { latitude: 15.2993, longitude: 73.9590 },
      // Sanvordem-Curchorem
      { latitude: 15.2667, longitude: 74.1167 },
      // Kulem
      { latitude: 15.2333, longitude: 74.2000 },
      // Castle Rock area
      { latitude: 15.3000, longitude: 74.2667 },
      // Heading west toward Vasco
      { latitude: 15.3833, longitude: 74.0000 },
      // Vasco da Gama
      { latitude: 15.3982, longitude: 73.8167 },
    ],
  },
];
