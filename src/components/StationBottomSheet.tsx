import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Station } from '../types/Station';
import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';
import { getTrainTypeColor } from './TrainCard';

interface StationBottomSheetProps {
  station: Station | null;
  trains: Train[];
  isLoading: boolean;
  onClose: () => void;
  onTrainPress: (train: Train) => void;
  onSeeAllPress: () => void;
}

const PREVIEW_COUNT = 4;

const StationBottomSheet: React.FC<StationBottomSheetProps> = ({
  station,
  trains,
  isLoading,
  onClose,
  onTrainPress,
  onSeeAllPress,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%', '85%'], []);

  useEffect(() => {
    if (station) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [station]);

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

  const previewTrains = trains.slice(0, PREVIEW_COUNT);

  const renderTrainRow = ({ item: train }: { item: Train }) => {
    const srcStation = STATION_MAP[train.sourceStationCode];
    const dstStation = STATION_MAP[train.destinationStationCode];
    const color = getTrainTypeColor(train.type);
    // Find arrival time at this station
    const stop = station
      ? train.stops.find(s => s.stationCode === station.code)
      : null;
    const time = stop?.arrivalTime ?? stop?.departureTime ?? '--:--';

    return (
      <TouchableOpacity style={styles.trainRow} onPress={() => onTrainPress(train)} activeOpacity={0.7}>
        <View style={styles.trainRowLeft}>
          <Text style={styles.arrivalTime}>{time}</Text>
        </View>
        <View style={[styles.trainTypeBar, { backgroundColor: color }]} />
        <View style={styles.trainRowBody}>
          <Text style={styles.trainRowName}>
            {train.trainNumber} {train.name}
          </Text>
          <Text style={styles.trainRowRoute}>
            {srcStation?.name ?? train.sourceStationCode}
            {' → '}
            {dstStation?.name ?? train.destinationStationCode}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  if (!station) return null;

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.stationDot, station.isGoaStation && styles.stationDotGoa]} />
            <View>
              <Text style={styles.stationName}>{station.name}</Text>
              <Text style={styles.stationMeta}>
                {station.code} · {station.state}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Train count */}
        <Text style={styles.sectionTitle}>
          {isLoading ? 'Loading...' : `${trains.length} trains`}
        </Text>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color="#1A73E8" />
        ) : (
          <FlatList
            data={previewTrains}
            keyExtractor={t => t.id}
            renderItem={renderTrainRow}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
        )}

        {trains.length > PREVIEW_COUNT && (
          <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAllPress} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See all {trains.length} trains →</Text>
          </TouchableOpacity>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default StationBottomSheet;

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#9CA3AF',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  stationDotGoa: {
    backgroundColor: '#1A73E8',
    borderColor: '#1565C0',
  },
  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  stationMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loader: {
    marginTop: 24,
  },
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  trainRowLeft: {
    width: 52,
    alignItems: 'flex-end',
  },
  arrivalTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  trainTypeBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  trainRowBody: {
    flex: 1,
    gap: 2,
  },
  trainRowName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  trainRowRoute: {
    fontSize: 11,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 62,
  },
  seeAllBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A73E8',
  },
});
