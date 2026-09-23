import { RailwayRoute } from '../types/RailwayRoute';
import { getFirebaseRoutes } from './firebaseRouteService';

export interface IRouteService {
  getAllRoutes(): Promise<RailwayRoute[]>;
  getRoute(id: string): Promise<RailwayRoute | null>;
}

class RouteService implements IRouteService {
  private _cachedRoutes: RailwayRoute[] | null = null;
  private _fetchPromise: Promise<RailwayRoute[]> | null = null;

  async getAllRoutes(): Promise<RailwayRoute[]> {
    if (this._cachedRoutes) {
      return this._cachedRoutes;
    }
    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = getFirebaseRoutes().then((routes) => {
      this._cachedRoutes = routes;
      return routes;
    });

    return this._fetchPromise;
  }

  async getRoute(id: string): Promise<RailwayRoute | null> {
    const all = await this.getAllRoutes();
    return all.find((r) => r.id === id) ?? null;
  }
}

export const routeService: IRouteService = new RouteService();
