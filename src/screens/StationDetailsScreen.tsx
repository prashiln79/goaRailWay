import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { trainService } from '../services/trainService';
import { stationService } from '../services/stationService';
import { STATION_MAP } from '../data/stations';
import { getTrainTypeColor } from '../components/TrainCard';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationDetailsRouteProp = RouteProp<RootStackParamList, 'StationDetails'>;
type StationDetailsNavProp = StackNavigationProp<RootStackParamList, 'StationDetails'>;

const StationDetailsScreen: React.FC = () => {
  const route = useRoute<StationDetailsRouteProp>();
  const navigation = useNavigation<StationDetailsNavProp>();
  const { stationCode } = route.params;

  const [station, setStation] = useState<Station | null>(null);
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      stationService.getStation(stationCode),
      trainService.getTrainsAtStation(stationCode),
    ]).then(([st, trs]) => {
      setStation(st);
      setTrains(trs);
      setLoading(false);
    });
  }, [stationCode]);

  const handleTrainPress = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const handleShowOnMap = useCallback(() => {
    navigation.navigate('MapScreen');
  }, [navigation]);

  const renderTrain = ({ item: train }: { item: Train }) => {
    const src = STATION_MAP[train.sourceStationCode];
    const dst = STATION_MAP[train.destinationStationCode];
    const color = getTrainTypeColor(train.type);
    const stop = train.stops.find(s => s.stationCode === stationCode);
    const time = stop?.arrivalTime ?? stop?.departureTime ?? '--:--';

    return (
      <TouchableOpacity
        style={styles.trainRow}
        onPress={() => handleTrainPress(train)}
        activeOpacity={0.7}
      >
        <Text style={styles.arrivalTime}>{time}</Text>
        <View style={[styles.typeBar, { backgroundColor: color }]} />
        <View style={styles.trainBody}>
          <Text style={styles.trainName}>
            {train.trainNumber} {train.name}
          </Text>
          <Text style={styles.trainRoute}>
            {src?.name ?? train.sourceStationCode} → {dst?.name ?? train.destinationStationCode}
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.typeBadgeText, { color }]}>{train.type}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>{station?.name ?? stationCode}</Text>
          {station?.isGoaStation && (
            <View style={styles.goaTag}>
              <Text style={styles.goaTagText}>GOA</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleShowOnMap} style={styles.mapBtn}>
          <Ionicons name="map-outline" size={20} color="#1A73E8" />
        </TouchableOpacity>
      </View>

      {/* Station info */}
      {station && (
        <View style={styles.stationInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              {stationCode} · {station.state}
            </Text>
          </View>
          {station.zone && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{station.zone} Railway Zone</Text>
            </View>
          )}
        </View>
      )}

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>TRAINS AT THIS STATION</Text>
        {!loading && <Text style={styles.count}>{trains.length} trains</Text>}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading trains...</Text>
      ) : (
        <FlatList
          data={trains}
          keyExtractor={t => t.id}
          renderItem={renderTrain}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default StationDetailsScreen;

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
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  goaTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  goaTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: 0.5,
  },
  mapBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  stationInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  count: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  arrivalTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    width: 52,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  typeBar: {
    width: 3,
    height: 38,
    borderRadius: 2,
  },
  trainBody: {
    flex: 1,
    gap: 3,
  },
  trainName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  trainRoute: {
    fontSize: 11,
    color: '#6B7280',
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  separator: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginLeft: 82,
  },
});
