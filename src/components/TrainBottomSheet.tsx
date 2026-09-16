import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';
import { getTrainTypeColor } from './TrainCard';

interface TrainBottomSheetProps {
  train: Train | null;
  onClose: () => void;
  onViewRoute: (train: Train) => void;
}

const DAYS_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TrainBottomSheet: React.FC<TrainBottomSheetProps> = ({ train, onClose, onViewRoute }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  useEffect(() => {
    if (train) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [train]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />
    ),
    [],
  );

  if (!train) return null;

  const srcStation = STATION_MAP[train.sourceStationCode];
  const dstStation = STATION_MAP[train.destinationStationCode];
  const color = getTrainTypeColor(train.type);

  // Find "next" stop in route (first Konkan stop for simulation)
  const nextStop = train.stops[Math.ceil(train.stops.length / 2)];
  const nextStation = nextStop ? STATION_MAP[nextStop.stationCode] : null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
    >
      <BottomSheetView style={styles.content}>
        {/* Close button */}
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* Train header */}
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
            <View style={[styles.typeDot, { backgroundColor: color }]} />
            <Text style={[styles.typeText, { color }]}>{train.type}</Text>
          </View>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
        </View>
        <Text style={styles.trainName}>{train.name}</Text>
        <Text style={styles.routeText}>
          {srcStation?.name ?? train.sourceStationCode}
          {' → '}
          {dstStation?.name ?? train.destinationStationCode}
        </Text>

        {/* Running days */}
        <View style={styles.daysRow}>
          {DAYS_LABELS.map((day, idx) => {
            const runs = train.runningDays.includes(idx);
            return (
              <View
                key={day}
                style={[styles.dayChip, runs ? { backgroundColor: color } : styles.dayChipOff]}
              >
                <Text style={[styles.dayText, runs ? styles.dayTextOn : styles.dayTextOff]}>
                  {day[0]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Next stop */}
        {nextStation && (
          <View style={styles.nextStopBox}>
            <Ionicons name="navigate-circle-outline" size={16} color="#1A73E8" />
            <Text style={styles.nextStopLabel}>Simulated Next Stop</Text>
            <Text style={styles.nextStopName}>
              {nextStation.name} — {nextStop?.arrivalTime ?? nextStop?.departureTime ?? '--:--'}
            </Text>
          </View>
        )}

        {/* Route preview */}
        <ScrollView
          style={styles.routePreview}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={styles.routeHeader}>ROUTE</Text>
          {train.stops.slice(0, 6).map((stop, idx) => {
            const st = STATION_MAP[stop.stationCode];
            const isFirst = idx === 0;
            const time = stop.departureTime ?? stop.arrivalTime ?? '--:--';
            return (
              <View key={stop.stationCode} style={styles.stopRow}>
                <View style={styles.stopLine}>
                  <View style={[styles.stopDot, isFirst && styles.stopDotFirst]} />
                  {idx < train.stops.slice(0, 6).length - 1 && (
                    <View style={styles.stopConnector} />
                  )}
                </View>
                <View style={styles.stopBody}>
                  <Text style={styles.stopName}>{st?.name ?? stop.stationCode}</Text>
                  <Text style={styles.stopTime}>{time}</Text>
                </View>
              </View>
            );
          })}
          {train.stops.length > 6 && (
            <Text style={styles.moreStops}>+{train.stops.length - 6} more stops</Text>
          )}
        </ScrollView>

        {/* View full route button */}
        <TouchableOpacity
          style={[styles.viewRouteBtn, { backgroundColor: color }]}
          onPress={() => onViewRoute(train)}
          activeOpacity={0.85}
        >
          <Ionicons name="map-outline" size={16} color="#FFFFFF" />
          <Text style={styles.viewRouteBtnText}>View Full Route</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default TrainBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: '#E5E7EB',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trainNumber: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  trainName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  routeText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },
  dayChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipOff: {
    backgroundColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayTextOn: {
    color: '#FFFFFF',
  },
  dayTextOff: {
    color: '#9CA3AF',
  },
  nextStopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  nextStopLabel: {
    fontSize: 11,
    color: '#1A73E8',
    fontWeight: '600',
  },
  nextStopName: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '700',
  },
  routePreview: {
    flex: 1,
    marginBottom: 14,
  },
  routeHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  stopRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  stopLine: {
    alignItems: 'center',
    width: 16,
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    marginTop: 4,
  },
  stopDotFirst: {
    backgroundColor: '#1A73E8',
    borderColor: '#1565C0',
  },
  stopConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
    minHeight: 16,
  },
  stopBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stopName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  stopTime: {
    fontSize: 13,
    color: '#6B7280',
    fontVariant: ['tabular-nums'],
  },
  moreStops: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  viewRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  viewRouteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
