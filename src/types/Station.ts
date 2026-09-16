export interface Station {
  id: string;
  code: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  isMajor?: boolean;
  isGoaStation?: boolean;
  zone?: string;
}
