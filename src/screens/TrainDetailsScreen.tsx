import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { TrainStop } from '../types/TrainStop';
import { trainService } from '../services/trainService';
import { STATION_MAP } from '../data/stations';
import { useSavedStore } from '../store/savedStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type TrainDetailsRouteProp = RouteProp<RootStackParamList, 'TrainDetails'>;
type TrainDetailsNavProp = StackNavigationProp<RootStackParamList>;

type TabOption = 'Overview' | 'Schedule' | 'Stops';

export const TrainDetailsScreen: React.FC = () => {
  const route = useRoute<TrainDetailsRouteProp>();
  const navigation = useNavigation<TrainDetailsNavProp>();
  const insets = useSafeAreaInsets();
  const { trainNumber } = route.params;

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabOption>('Overview');

  const { isTrainSaved, toggleTrainFavorite } = useSavedStore();
  const isFavorite = isTrainSaved(trainNumber);

  useEffect(() => {
    trainService.getTrain(trainNumber).then(t => {
      setTrain(t);
      setLoading(false);
    });
  }, [trainNumber]);


  if (loading || !train) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading train details...</Text>
      </SafeAreaView>
    );
  }

  const srcStation = STATION_MAP[train.sourceStationCode];
  const dstStation = STATION_MAP[train.destinationStationCode];

  // Check if Goa station
  const isGoaStation = (code: string) => {
    return ['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'].includes(code);
  };

  const renderStop = ({ item, index }: { item: TrainStop; index: number }) => {
    const station = STATION_MAP[item.stationCode];
    const isFirst = index === 0;
    const isLast = index === train.stops.length - 1;
    const time = isFirst
      ? item.departureTime
      : isLast
      ? item.arrivalTime
      : item.arrivalTime ?? item.departureTime;

    const isGoa = isGoaStation(item.stationCode);

    return (
      <View style={styles.stopRow}>
        {/* Departure/Arrival Time */}
        <View style={styles.timeBox}>
          <Text style={styles.stopTime}>{time}</Text>
        </View>

        {/* Timeline Visual */}
        <View style={styles.timeline}>
          {!isFirst && <View style={styles.lineTop} />}
          <View
            style={[
              styles.stopDot,
              isFirst || isLast ? styles.stopDotTerminal : undefined,
              isGoa ? styles.stopDotGoa : undefined,
            ]}
          />
          {!isLast && <View style={styles.lineBottom} />}
        </View>

        {/* Station info */}
        <View style={styles.stopInfo}>
          <View style={styles.stationTitleRow}>
            <Text style={[styles.stopStationName, (isFirst || isLast) && styles.terminalName]}>
              {station?.name ?? item.stationCode}
            </Text>
            {isFirst && <Text style={styles.tagTerminal}>(Start)</Text>}
            {isLast && <Text style={styles.tagTerminal}>(End)</Text>}
            {isGoa && !isFirst && !isLast && (
              <View style={styles.goaTag}>
                <Text style={styles.goaTagText}>(Goa)</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#2C201A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Train Details</Text>
        <TouchableOpacity
          onPress={() => toggleTrainFavorite(trainNumber)}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#DC2626' : '#2C201A'}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={train.stops}
        keyExtractor={item => `${item.stationCode}-${item.sequence}`}
        renderItem={renderStop}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Train Image Banner */}
            <View style={styles.bannerContainer}>
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="train" size={54} color="#C4B7AF" />
                <Text style={styles.bannerText}>Konkan Coastline Scenic Route</Text>
              </View>
            </View>

            {/* Train Title & Status */}
            <View style={styles.headerInfo}>
              <Text style={styles.mainTitle}>{train.trainNumber} {train.name}</Text>

              {/* Running Status Badge */}
              <View style={styles.runsStatusBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#1E824C" />
                <Text style={styles.runsStatusText}>Runs on selected date</Text>
              </View>

              {/* Route */}
              <Text style={styles.routeSubtitle}>
                {srcStation?.name ?? train.sourceStationCode} → {dstStation?.name ?? train.destinationStationCode}
              </Text>

              {/* Tag Chips Row */}
              <View style={styles.tagChipsRow}>
                <View style={styles.tagChip}>
                  <Ionicons name="flash-outline" size={12} color="#8A4A1C" />
                  <Text style={styles.tagChipText}>{train.type}</Text>
                </View>
                <View style={styles.tagChip}>
                  <Ionicons name="repeat-outline" size={12} color="#8A4A1C" />
                  <Text style={styles.tagChipText}>Daily</Text>
                </View>
                <View style={styles.tagChip}>
                  <Ionicons name="restaurant-outline" size={12} color="#8A4A1C" />
                  <Text style={styles.tagChipText}>Pantry</Text>
                </View>
                <View style={styles.tagChip}>
                  <Ionicons name="shield-checkmark-outline" size={12} color="#8A4A1C" />
                  <Text style={styles.tagChipText}>LHB</Text>
                </View>
              </View>
            </View>

            {/* Tabs Row */}
            <View style={styles.tabsRow}>
              {(['Overview', 'Schedule', 'Stops'] as TabOption[]).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, isActive && styles.tabItemActive]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Intermediate summary */}
            <View style={styles.stopsSummaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="git-commit-outline" size={14} color="#7A6B63" />
                <Text style={styles.summaryText}>{train.stops.length - 2} intermediate stops</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="leaf-outline" size={14} color="#1E824C" />
                <Text style={[styles.summaryText, { color: '#1E824C', fontWeight: '700' }]}>5 Goa stations</Text>
              </View>
            </View>
          </View>
        }
      />

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => Linking.openURL('https://www.irctc.co.in/nget/train-search').catch(() => {})}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaButtonText}>Book on IRCTC</Text>
          <Ionicons name="open-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TrainDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#7A6B63',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C201A',
  },
  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 140,
    backgroundColor: '#E7DFD8',
    marginBottom: 14,
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: '#8F7057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#FBF8F5',
    fontWeight: '700',
    marginTop: 8,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  headerInfo: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C201A',
  },
  runsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 6,
  },
  runsStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E824C',
  },
  routeSubtitle: {
    fontSize: 14,
    color: '#7A6B63',
    fontWeight: '500',
  },
  tagChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7E1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7E1',
    marginHorizontal: 16,
    marginTop: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#9E3C1B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A7A71',
  },
  tabTextActive: {
    color: '#9E3C1B',
    fontWeight: '700',
  },
  stopsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#7A6B63',
  },
  stopRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 52,
  },
  timeBox: {
    width: 60,
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  stopTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#382A22',
  },
  timeline: {
    width: 28,
    alignItems: 'center',
  },
  lineTop: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    width: 2,
    backgroundColor: '#E2D7CF',
  },
  lineBottom: {
    position: 'absolute',
    top: '50%',
    bottom: 0,
    width: 2,
    backgroundColor: '#E2D7CF',
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#A8998E',
    marginTop: 4,
    zIndex: 2,
  },
  stopDotTerminal: {
    borderColor: '#9E3C1B',
    backgroundColor: '#9E3C1B',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stopDotGoa: {
    borderColor: '#1E824C',
    backgroundColor: '#EBF7EE',
  },
  stopInfo: {
    flex: 1,
    paddingLeft: 8,
    paddingTop: 2,
  },
  stationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  stopStationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#382A22',
  },
  terminalName: {
    fontWeight: '800',
    color: '#1C1613',
  },
  tagTerminal: {
    fontSize: 12,
    color: '#8A7A71',
  },
  goaTag: {
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  goaTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E824C',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE7E1',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ctaButton: {
    backgroundColor: '#9E3C1B',
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
