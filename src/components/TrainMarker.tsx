import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';
import { getTrainTypeColor } from './TrainCard';

interface TrainMarkerProps {
  train: Train;
  isSelected: boolean;
  isMuted: boolean;
  onPress: (train: Train) => void;
}

/**
 * Computes a simulated geographic position for the train based on its
 * scheduled stops. For V1 MVP this interpolates between adjacent stop
 * stations. Replace with real-time positioning in a future version.
 */
function getSimulatedPosition(train: Train): { latitude: number; longitude: number } | null {
  // Find the midpoint between the first and second Konkan corridor stop
  const konkanCodes = new Set(['PNVL', 'ROHA', 'CHI', 'RN', 'KKW', 'SWV', 'PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'KARW']);
  const konkanStops = train.stops.filter(s => konkanCodes.has(s.stationCode));
  if (konkanStops.length < 2) {
    // Use first available stop
    const first = train.stops[Math.floor(train.stops.length / 2)];
    const station = first ? STATION_MAP[first.stationCode] : null;
    return station ? { latitude: station.latitude, longitude: station.longitude } : null;
  }
  // Pick the midpoint stop
  const mid = konkanStops[Math.floor(konkanStops.length / 2)];
  const station = STATION_MAP[mid.stationCode];
  if (!station) return null;
  // Offset slightly so multiple trains on same stop don't overlap
  const offset = (parseInt(train.trainNumber) % 10) * 0.03;
  return {
    latitude: station.latitude + offset * 0.1,
    longitude: station.longitude + offset * 0.05,
  };
}

const TrainMarker: React.FC<TrainMarkerProps> = memo(
  ({ train, isSelected, isMuted, onPress }) => {
    const position = getSimulatedPosition(train);
    if (!position) return null;

    const color = getTrainTypeColor(train.type);

    return (
      <Marker
        coordinate={position}
        onPress={() => onPress(train)}
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={isSelected ? 10 : 1}
      >
        <TouchableOpacity
          onPress={() => onPress(train)}
          activeOpacity={0.8}
          style={[
            styles.markerContainer,
            isSelected && styles.markerSelected,
            isMuted && styles.markerMuted,
          ]}
        >
          <View style={[styles.pill, { backgroundColor: color }]}>
            <Ionicons name="train" size={9} color="#FFFFFF" />
            <Text style={styles.trainNum}>{train.trainNumber.slice(-4)}</Text>
          </View>
          {isSelected && <View style={[styles.selectedDot, { backgroundColor: color }]} />}
        </TouchableOpacity>
      </Marker>
    );
  },
);

TrainMarker.displayName = 'TrainMarker';

export default TrainMarker;

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  markerSelected: {
    transform: [{ scale: 1.25 }],
  },
  markerMuted: {
    opacity: 0.3,
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  trainNum: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
