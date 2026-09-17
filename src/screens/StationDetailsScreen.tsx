import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { trainService } from '../services/trainService';
import { stationService } from '../services/stationService';
import { STATION_MAP } from '../data/stations';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationDetailsRouteProp = RouteProp<RootStackParamList, 'StationDetails'>;
type StationDetailsNavProp = StackNavigationProp<RootStackParamList>;

type TabOption = 'Overview' | 'Arrivals' | 'Departures' | 'Trains';

export const StationDetailsScreen: React.FC = () => {
  const route = useRoute<StationDetailsRouteProp>();
  const navigation = useNavigation<StationDetailsNavProp>();
  const insets = useSafeAreaInsets();
  const { stationCode } = route.params;

  const [station, setStation] = useState<Station | null>(null);
  const [trains, setTrains] = useState<Train[]>([]);
  const [activeTab, setActiveTab] = useState<TabOption>('Overview');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    Promise.all([
      stationService.getStation(stationCode),
      trainService.getTrainsAtStation(stationCode),
    ]).then(([st, trs]) => {
      setStation(st);
      setTrains(trs);
    });
  }, [stationCode]);

  const handleTrainPress = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const popularRoutes = [
    { from: station?.name ?? stationCode, to: 'Mumbai LTT', trains: '12 trains' },
    { from: station?.name ?? stationCode, to: 'Madgaon', trains: '18 trains' },
    { from: station?.name ?? stationCode, to: 'Mangaluru', trains: '10 trains' },
    { from: station?.name ?? stationCode, to: 'Pune', trains: '4 trains' },
  ];

  const renderTrain = ({ item: train }: { item: Train }) => {
    const src = STATION_MAP[train.sourceStationCode];
    const dst = STATION_MAP[train.destinationStationCode];
    const stop = train.stops.find(s => s.stationCode === stationCode);

    return (
      <TouchableOpacity
        style={styles.trainCard}
        onPress={() => handleTrainPress(train)}
        activeOpacity={0.8}
      >
        <View style={styles.trainTopRow}>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
          <Text style={styles.trainName} numberOfLines={1}>{train.name}</Text>
        </View>

        <Text style={styles.routeText}>
          {src?.name ?? train.sourceStationCode} → {dst?.name ?? train.destinationStationCode}
        </Text>

        <View style={styles.timingRow}>
          <View style={styles.timeTag}>
            <Text style={styles.timeTagLabel}>Arr: </Text>
            <Text style={styles.timeTagVal}>{stop?.arrivalTime ?? 'Starts'}</Text>
          </View>
          <View style={styles.timeTag}>
            <Text style={styles.timeTagLabel}>Dep: </Text>
            <Text style={styles.timeTagVal}>{stop?.departureTime ?? 'Terminates'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#2C201A" />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.headerStationTitle}>
            {station?.name ?? stationCode} ({stationCode})
          </Text>
          <Text style={styles.headerStationSub}>
            {station?.isMajor ? 'Major station' : 'Halt station'} · {station?.state ?? 'Konkan'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#DC2626' : '#2C201A'}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['Overview', 'Arrivals', 'Departures', 'Trains'] as TabOption[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={activeTab === 'Trains' ? trains : []}
        keyExtractor={item => item.trainNumber}
        renderItem={renderTrain}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.contentBody}>
            {/* Stat Cards Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#EBF7EE' }]}>
                <Text style={[styles.statValue, { color: '#1E824C' }]}>28</Text>
                <Text style={styles.statLabel}>Trains arriving</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.statValue, { color: '#2563EB' }]}>31</Text>
                <Text style={styles.statLabel}>Trains departing</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F5F3FF' }]}>
                <Text style={[styles.statValue, { color: '#7C3AED' }]}>52</Text>
                <Text style={styles.statLabel}>Total trains</Text>
              </View>
            </View>

            {/* About Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeader}>About</Text>
              <Text style={styles.aboutText}>
                {station?.name ?? stationCode} is a major railway station in {station?.state ?? 'Konkan'}, well connected to Mumbai, Konkan corridor and South Goa. It serves as an essential station for connecting passenger services and major superfast trains.
              </Text>
            </View>

            {/* Popular Routes from this Station */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeader}>Popular routes from {station?.name ?? stationCode}</Text>
              {popularRoutes.map((route, idx) => (
                <View
                  key={idx}
                  style={[styles.popularRow, idx === popularRoutes.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <Text style={styles.popRouteText}>
                    {route.from} → {route.to}
                  </Text>
                  <Text style={styles.popRouteCount}>{route.trains}</Text>
                </View>
              ))}
            </View>

            {/* Trains List Header if tab is not Trains */}
            {activeTab === 'Overview' && (
              <View style={styles.viewTrainsPrompt}>
                <Text style={styles.promptTitle}>Key Trains at this Station</Text>
              </View>
            )}
            {activeTab === 'Overview' && trains.slice(0, 4).map(t => (
              <View key={t.trainNumber}>
                {renderTrain({ item: t })}
              </View>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default StationDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
  },
  headerStationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C201A',
  },
  headerStationSub: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#9E3C1B',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A7A71',
  },
  tabBtnTextActive: {
    color: '#9E3C1B',
    fontWeight: '700',
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B584E',
    marginTop: 2,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C201A',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    color: '#554238',
    lineHeight: 19,
  },
  popularRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F2EE',
  },
  popRouteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C201A',
  },
  popRouteCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7A71',
  },
  viewTrainsPrompt: {
    marginVertical: 8,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C201A',
  },
  trainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  trainTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trainNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C201A',
  },
  trainName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#382A22',
    flex: 1,
  },
  routeText: {
    fontSize: 13,
    color: '#7A6B63',
    marginVertical: 4,
  },
  timingRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTagLabel: {
    fontSize: 12,
    color: '#8A7A71',
  },
  timeTagVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C201A',
  },
});
