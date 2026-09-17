import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Station } from '../types/Station';
import { Train } from '../types/Train';
import { RailwayRoute } from '../types/RailwayRoute';
import { STATION_MAP } from '../data/stations';
import StationMarker from './StationMarker';
import TrainMarker from './TrainMarker';

interface RailwayMapProps {
  stations: Station[];
  trains: Train[];
  routes: RailwayRoute[];
  selectedTrain: Train | null;
  selectedStation: Station | null;
  initialRegion: Region;
  onStationPress: (station: Station) => void;
  onTrainPress: (train: Train) => void;
  onRegionChange: (region: Region) => void;
  mapRef?: React.RefObject<MapView | null>;
}

/**
 * Builds a set of station codes used by the selected train's route,
 * so non-route stations can be visually muted.
 */
function getTrainStationCodes(train: Train | null): Set<string> {
  if (!train) return new Set();
  return new Set(train.stops.map(s => s.stationCode));
}

/**
 * Builds the highlighted polyline coordinates for a selected train's route.
 * Only includes stations that exist in our STATION_MAP.
 */
function buildTrainRouteCoords(
  train: Train,
): { latitude: number; longitude: number }[] {
  return train.stops
    .map(s => STATION_MAP[s.stationCode])
    .filter(Boolean)
    .map(s => ({ latitude: s!.latitude, longitude: s!.longitude }));
}

const LIGHT_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5e8e8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#dadada' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9e2f4' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
];

const RailwayMap: React.FC<RailwayMapProps> = memo(
  ({
    stations,
    trains,
    routes,
    selectedTrain,
    selectedStation,
    initialRegion,
    onStationPress,
    onTrainPress,
    onRegionChange,
    mapRef,
  }) => {
    const trainStationCodes = useMemo(
      () => getTrainStationCodes(selectedTrain),
      [selectedTrain],
    );

    const selectedTrainRoute = useMemo(
      () => (selectedTrain ? buildTrainRouteCoords(selectedTrain) : null),
      [selectedTrain],
    );

    const handleStationPress = useCallback(
      (station: Station) => {
        onStationPress(station);
      },
      [onStationPress],
    );

    const handleTrainPress = useCallback(
      (train: Train) => {
        onTrainPress(train);
      },
      [onTrainPress],
    );

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          onRegionChangeComplete={onRegionChange}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          mapType="standard"
          customMapStyle={LIGHT_MAP_STYLE}
          toolbarEnabled={false}
        >
          {/* ─── Railway infrastructure polylines ─── */}
          {routes.map(route => (
            <Polyline
              key={route.id}
              coordinates={route.coordinates}
              strokeColor={
                selectedTrain
                  ? route.lineType === 'main'
                    ? '#CBD5E1'
                    : '#CBD5E1'
                  : route.color ?? '#1A73E8'
              }
              strokeWidth={route.lineType === 'main' ? 3 : 2}
              lineDashPattern={route.lineType === 'branch' ? [6, 4] : undefined}
              zIndex={1}
            />
          ))}

          {/* ─── Selected train route highlight ─── */}
          {selectedTrain && selectedTrainRoute && selectedTrainRoute.length > 1 && (
            <Polyline
              coordinates={selectedTrainRoute}
              strokeColor={`${selectedTrain ? '#1A73E8' : '#1A73E8'}`}
              strokeWidth={5}
              zIndex={5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* ─── Station markers ─── */}
          {stations.map(station => {
            const isMuted =
              selectedTrain !== null && !trainStationCodes.has(station.code);
            const isSelected = selectedStation?.code === station.code;
            return (
              <StationMarker
                key={station.id}
                station={station}
                isSelected={isSelected}
                isMuted={isMuted}
                onPress={handleStationPress}
              />
            );
          })}

          {/* ─── Train markers ─── */}
          {trains.map(train => {
            const isSelected = selectedTrain?.id === train.id;
            const isMuted = selectedTrain !== null && !isSelected;
            return (
              <TrainMarker
                key={train.id}
                train={train}
                isSelected={isSelected}
                isMuted={isMuted}
                onPress={handleTrainPress}
              />
            );
          })}
        </MapView>
      </View>
    );
  },
);

RailwayMap.displayName = 'RailwayMap';

export default RailwayMap;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  map: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  polylineOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    width: '100%',
    height: '100%',
  },
});
