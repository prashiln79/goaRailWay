export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export type LineType = 'main' | 'branch';

export interface RailwayRoute {
  id: string;
  name: string;
  /** Array of lat/lng waypoints that trace the actual railway geometry */
  coordinates: RouteCoordinate[];
  lineType: LineType;
  color?: string;
}
