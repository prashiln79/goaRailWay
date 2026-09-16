import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { Station } from '../types/Station';

interface StationMarkerProps {
  station: Station;
  isSelected: boolean;
  isMuted: boolean;
  onPress: (station: Station) => void;
}

const StationMarker: React.FC<StationMarkerProps> = memo(
  ({ station, isSelected, isMuted, onPress }) => {
    const isGoa = station.isGoaStation;
    const isMajor = station.isMajor;

    const markerSize = isMajor ? (isGoa ? 14 : 11) : 8;
    const borderWidth = isMajor ? 2.5 : 1.5;
    const fillColor = isSelected
      ? '#F59E0B'
      : isGoa
      ? '#1A73E8'
      : isMuted
      ? '#D1D5DB'
      : '#FFFFFF';
    const borderColor = isSelected
      ? '#D97706'
      : isGoa
      ? '#1565C0'
      : isMuted
      ? '#D1D5DB'
      : '#6B7280';

    return (
      <Marker
        coordinate={{ latitude: station.latitude, longitude: station.longitude }}
        onPress={() => onPress(station)}
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.wrapper}>
          <TouchableOpacity
            onPress={() => onPress(station)}
            activeOpacity={0.7}
            style={styles.touchArea}
          >
            {/* Pulse ring for selected major stations */}
            {isSelected && (
              <View
                style={[
                  styles.pulseRing,
                  { width: markerSize + 16, height: markerSize + 16, borderRadius: (markerSize + 16) / 2 },
                ]}
              />
            )}
            <View
              style={[
                styles.dot,
                {
                  width: markerSize,
                  height: markerSize,
                  borderRadius: markerSize / 2,
                  backgroundColor: fillColor,
                  borderColor,
                  borderWidth,
                  opacity: isMuted ? 0.4 : 1,
                },
              ]}
            />
          </TouchableOpacity>

          {/* Label for major stations */}
          {isMajor && !isMuted && (
            <View style={styles.labelContainer}>
              <Text
                style={[
                  styles.label,
                  isGoa && styles.labelGoa,
                  isSelected && styles.labelSelected,
                ]}
                numberOfLines={1}
              >
                {station.name}
              </Text>
            </View>
          )}
        </View>
      </Marker>
    );
  },
);

StationMarker.displayName = 'StationMarker';

export default StationMarker;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  touchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: '#F59E0B22',
    borderWidth: 1.5,
    borderColor: '#F59E0B88',
  },
  labelContainer: {
    marginTop: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.1,
  },
  labelGoa: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  labelSelected: {
    color: '#D97706',
  },
});
