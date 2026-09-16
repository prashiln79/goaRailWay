import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { TrainStop } from '../types/TrainStop';
import { trainService } from '../services/trainService';
import { STATION_MAP } from '../data/stations';
import { getTrainTypeColor } from '../components/TrainCard';
import { RootStackParamList } from '../navigation/AppNavigator';

type TrainDetailsRouteProp = RouteProp<RootStackParamList, 'TrainDetails'>;
type TrainDetailsNavProp = StackNavigationProp<RootStackParamList, 'TrainDetails'>;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TrainDetailsScreen: React.FC = () => {
  const route = useRoute<TrainDetailsRouteProp>();
  const navigation = useNavigation<TrainDetailsNavProp>();
  const { trainNumber } = route.params;

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainService.getTrain(trainNumber).then(t => {
      setTrain(t);
      setLoading(false);
    });
  }, [trainNumber]);

  const handleShowOnMap = useCallback(() => {
    navigation.navigate('MapScreen');
  }, [navigation]);

  if (loading || !train) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading train details...</Text>
      </SafeAreaView>
    );
  }

  const color = getTrainTypeColor(train.type);
  const srcStation = STATION_MAP[train.sourceStationCode];
  const dstStation = STATION_MAP[train.destinationStationCode];

  const renderStop = ({ item, index }: { item: TrainStop; index: number }) => {
    const station = STATION_MAP[item.stationCode];
    const isFirst = index === 0;
    const isLast = index === train.stops.length - 1;
    const time = isFirst
      ? item.departureTime
      : isLast
      ? item.arrivalTime
      : item.arrivalTime ?? item.departureTime;

    return (
      <View style={styles.stopRow}>
        {/* Timeline */}
        <View style={styles.timeline}>
          {!isFirst && <View style={[styles.lineTop, { backgroundColor: color + '50' }]} />}
          <View
            style={[
              styles.stopDot,
              { borderColor: color, backgroundColor: isFirst || isLast ? color : '#FFFFFF' },
            ]}
          />
          {!isLast && <View style={[styles.lineBottom, { backgroundColor: color + '50' }]} />}
        </View>

        {/* Content */}
        <View style={[styles.stopContent, !isLast && styles.stopContentBorder]}>
          <View style={styles.stopMain}>
            <Text style={[styles.stopName, (isFirst || isLast) && { color, fontWeight: '800' }]}>
              {station?.name ?? item.stationCode}
            </Text>
            {station?.isGoaStation && (
              <View style={styles.goaBadge}>
                <Text style={styles.goaBadgeText}>GOA</Text>
              </View>
            )}
          </View>
          <View style={styles.stopMeta}>
            <Text style={styles.stopCode}>{item.stationCode}</Text>
            {item.dayOffset > 0 && (
              <Text style={styles.dayOffsetBadge}>+{item.dayOffset}d</Text>
            )}
          </View>
          {time && (
            <Text style={[styles.stopTime, (isFirst || isLast) && { color, fontWeight: '700' }]}>
              {time}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.typePill, { backgroundColor: color + '20' }]}>
            <Text style={[styles.typePillText, { color }]}>{train.type}</Text>
          </View>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
        </View>
        <TouchableOpacity onPress={handleShowOnMap} style={styles.mapBtn}>
          <Ionicons name="map-outline" size={20} color={color} />
          <Text style={[styles.mapBtnText, { color }]}>Map</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={[styles.hero, { borderLeftColor: color }]}>
        <Text style={styles.heroName}>{train.name}</Text>
        <Text style={styles.heroRoute}>
          {srcStation?.name ?? train.sourceStationCode}
          {' '}
          <Ionicons name="arrow-forward" size={12} color="#6B7280" />
          {' '}
          {dstStation?.name ?? train.destinationStationCode}
        </Text>

        {/* Running days */}
        <View style={styles.daysRow}>
          {DAYS.map((day, idx) => {
            const runs = train.runningDays.includes(idx);
            return (
              <View
                key={day}
                style={[
                  styles.dayChip,
                  runs ? { backgroundColor: color } : styles.dayChipOff,
                ]}
              >
                <Text style={[styles.dayText, runs ? styles.dayOn : styles.dayOff]}>{day[0]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Route section label */}
      <View style={styles.sectionHeader}>
        <Ionicons name="git-commit-outline" size={15} color="#6B7280" />
        <Text style={styles.sectionLabel}>COMPLETE ROUTE</Text>
        <Text style={styles.stopCount}>{train.stops.length} stops</Text>
      </View>

      {/* Stop list */}
      <FlatList
        data={train.stops}
        keyExtractor={s => s.stationCode}
        renderItem={renderStop}
        contentContainerStyle={styles.stopList}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.showOnMapBtn, { backgroundColor: color }]}
          onPress={handleShowOnMap}
          activeOpacity={0.85}
        >
          <Ionicons name="map" size={18} color="#FFFFFF" />
          <Text style={styles.showOnMapText}>Show on Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TrainDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trainNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  mapBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hero: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.2,
  },
  heroRoute: {
    fontSize: 14,
    color: '#6B7280',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  dayChip: {
    width: 26,
    height: 26,
    borderRadius: 7,
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
  dayOn: {
    color: '#FFFFFF',
  },
  dayOff: {
    color: '#D1D5DB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    flex: 1,
  },
  stopCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  stopList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stopRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  lineTop: {
    flex: 1,
    width: 2,
  },
  lineBottom: {
    flex: 1,
    width: 2,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginVertical: 2,
    zIndex: 1,
  },
  stopContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingBottom: 12,
    gap: 8,
  },
  stopContentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stopMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stopName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  goaBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  goaBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: 0.5,
  },
  stopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stopCode: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dayOffsetBadge: {
    fontSize: 9,
    color: '#F59E0B',
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stopTime: {
    fontSize: 14,
    color: '#6B7280',
    fontVariant: ['tabular-nums'],
    minWidth: 48,
    textAlign: 'right',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  showOnMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  showOnMapText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
