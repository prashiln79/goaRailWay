import { RailwayRoute } from '../types/RailwayRoute';
import { RAILWAY_ROUTES } from '../data/routes';

export interface IRouteService {
  getAllRoutes(): Promise<RailwayRoute[]>;
  getRoute(id: string): Promise<RailwayRoute | null>;
}

class MockRouteService implements IRouteService {
  async getAllRoutes(): Promise<RailwayRoute[]> {
    return Promise.resolve(RAILWAY_ROUTES);
  }

  async getRoute(id: string): Promise<RailwayRoute | null> {
    return Promise.resolve(RAILWAY_ROUTES.find(r => r.id === id) ?? null);
  }
}

export const routeService: IRouteService = new MockRouteService();
