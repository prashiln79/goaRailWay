import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Train } from '../types/Train';
import { trainService } from '../services/trainService';
import { TrainCard } from '../components/TrainCard';
import { SearchJourneyModal } from '../components/SearchJourneyModal';
import { AdvanceBookingCalendarModal } from '../components/AdvanceBookingCalendarModal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCorridorStore } from '../store/corridorStore';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

import {
  CorridorHubId,
  HubStation,
  CorridorHub,
  CORRIDOR_HUBS,
  GOA_STATION_CODES,
  NEARBY_GOA_STATION_CODES,
} from '../data/corridorHubs';
import {
  SortType,
  SORT_OPTIONS,
  filterAndSortTrains,
  getContextualSegment,
} from '../utils/trainFilterUtils';

// Re-export domain types and constants for backward compatibility
export {
  CorridorHubId,
  HubStation,
  CorridorHub,
  CORRIDOR_HUBS,
  GOA_STATION_CODES,
  NEARBY_GOA_STATION_CODES,
};

type TrainsHomeNavProp = StackNavigationProp<RootStackParamList>;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TrainsHomeScreen: React.FC = () => {
  const navigation = useNavigation<TrainsHomeNavProp>();
  const insets = useSafeAreaInsets();
  const { handleScroll, showTabBar } = useTabBarVisibility();

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar])
  );

  // ── State ────────────────────────────────────────────────────────
  const [allTrains, setAllTrains] = useState<Train[]>([]);

  // 60-Day Advance Reservation Period (ARP) Date
  const bookingDateInfo = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + 60);
    const day = target.getDate();
    const month = MONTH_NAMES[target.getMonth()];
    const dayName = DAY_NAMES[target.getDay()];
    const year = target.getFullYear();
    return `${day} ${month} ${year} (${dayName})`;
  }, []);

  // Filters & Sorting: Major Corridor Hubs + Dynamic Station Sub-menu
  const { selectedHub, setSelectedHub } = useCorridorStore();
  const [selectedStationCode, setSelectedStationCode] = useState<string | null>(
    selectedHub === 'Mumbai' ? 'ALL_MUMBAI' : 'ALL_GOA',
  );
  const [sortOption, setSortOption] = useState<SortType>('Night journeys first');

  // Modals
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  // ── Data Loading ─────────────────────────────────────────────────
  useEffect(() => {
    trainService.getAllTrains().then(trains => {
      setAllTrains(trains);
    });
  }, []);

  // ── Navigation Callbacks ─────────────────────────────────────────
  const handleTrainPress = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const handleSelectStation = useCallback(
    (stationCode: string) => {
      navigation.navigate('StationDetails', { stationCode });
    },
    [navigation],
  );

  const handleHubSelect = useCallback(
    (hubId: CorridorHubId) => {
      setSelectedHub(hubId);
      if (hubId === 'Goa') setSelectedStationCode('ALL_GOA');
      else if (hubId === 'Mumbai') setSelectedStationCode('ALL_MUMBAI');
      else setSelectedStationCode(null);
    },
    [setSelectedHub],
  );

  // Keep station code in sync if hub was changed from another screen
  useEffect(() => {
    if (selectedHub === 'Goa' && (!selectedStationCode || selectedStationCode.includes('MUMBAI'))) {
      setSelectedStationCode('ALL_GOA');
    } else if (selectedHub === 'Mumbai' && (!selectedStationCode || selectedStationCode.includes('GOA'))) {
      setSelectedStationCode('ALL_MUMBAI');
    }
  }, [selectedHub, selectedStationCode]);

  // ── Computed Values ──────────────────────────────────────────────
  const activeHub = useMemo(() => {
    return CORRIDOR_HUBS.find(h => h.id === selectedHub);
  }, [selectedHub]);

  const activeStationObj = useMemo(() => {
    return activeHub?.stations.find(s => s.code === selectedStationCode);
  }, [activeHub, selectedStationCode]);

  const filteredTrains = useMemo(() => {
    return filterAndSortTrains(allTrains, {
      selectedHub,
      selectedStationCode,
      sortOption,
    });
  }, [allTrains, selectedHub, selectedStationCode, sortOption]);

  const headingTitle = useMemo(() => {
    if (activeStationObj && !activeStationObj.code.startsWith('ALL_')) {
      return `${filteredTrains.length} Trains · ${activeStationObj.shortName}`;
    }
    return `${filteredTrains.length} Trains to ${selectedHub}`;
  }, [selectedHub, activeStationObj, filteredTrains.length]);

  // ── Train Card Renderer ──────────────────────────────────────────
  const renderExplorerCard = useCallback(
    (train: Train, index?: number) => {
      const segment = getContextualSegment(train, selectedHub, selectedStationCode);
      const isNearbyAlt =
        selectedHub === 'Goa' &&
        !train.stops.some(s => GOA_STATION_CODES.has(s.stationCode)) &&
        train.stops.some(s => NEARBY_GOA_STATION_CODES.has(s.stationCode));

      return (
        <TrainCard
          key={train.trainNumber}
          train={train}
          index={index}
          onPress={handleTrainPress}
          segment={segment}
          showAltNotice={isNearbyAlt}
        />
      );
    },
    [selectedHub, selectedStationCode, handleTrainPress],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandTitleGroup}>
            <View style={styles.brandIconBox}>
              <Ionicons name="train" size={18} color="#9E3C1B" />
            </View>
            <Text style={styles.appName}>Goa-Mumbai Train Planner</Text>
          </View>
        </View>

        {/* 60-Day Advance Booking Banner */}
        <TouchableOpacity
          style={styles.bookingBanner}
          onPress={() => setCalendarModalVisible(true)}
          activeOpacity={0.75}
        >
          <View style={styles.bookingBannerLeft}>
            <Ionicons name="calendar" size={13} color="#9E3C1B" />
            <Text style={styles.bookingBannerLabel}>60-day booking open</Text>
          </View>
          <View style={styles.bookingBannerRight}>
            <Text style={styles.bookingBannerDate}>{bookingDateInfo}</Text>
            <Ionicons name="chevron-forward" size={14} color="#9E3C1B" style={{ marginLeft: 3 }} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Train Feed */}
      <FlatList
        data={filteredTrains}
        keyExtractor={item => `feed-train-${item.trainNumber}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Search Bar Button */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={18} color="#9E3C1B" style={styles.searchBarIcon} />
              <Text style={styles.searchBarPlaceholder}>
                Search train, station or route...
              </Text>
              <View style={styles.searchBarShortcut}>
                <Ionicons name="options-outline" size={14} color="#9E3C1B" />
              </View>
            </TouchableOpacity>

            {/* Corridor Hub Segmented Tabs */}
            <View style={styles.hubTabsRow}>
              {CORRIDOR_HUBS.map(hub => {
                const isActive = selectedHub === hub.id;
                return (
                  <TouchableOpacity
                    key={hub.id}
                    style={[styles.hubTab, isActive && styles.hubTabActive]}
                    onPress={() => handleHubSelect(hub.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={hub.icon}
                      size={15}
                      color={isActive ? '#FFFFFF' : '#8A4A1C'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.hubTabText,
                        isActive && styles.hubTabTextActive,
                      ]}
                    >
                      {hub.label} Trains
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Station Filter Pills (Clean horizontal scroll directly on canvas) */}
            {activeHub && activeHub.stations.length > 0 && (
              <View style={styles.stationFilterContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.stationFilterScroll}
                >
                  {activeHub.stations.map(stn => {
                    const isStnActive = selectedStationCode === stn.code;
                    return (
                      <TouchableOpacity
                        key={stn.code}
                        style={[styles.stationChip, isStnActive && styles.stationChipActive]}
                        onPress={() => setSelectedStationCode(stn.code)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.stationChipText,
                            isStnActive && styles.stationChipTextActive,
                          ]}
                        >
                          {stn.shortName}
                        </Text>
                        {stn.tag && (
                          <View
                            style={[
                              styles.stationTagBadge,
                              isStnActive && styles.stationTagBadgeActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.stationTagBadgeText,
                                isStnActive && styles.stationTagBadgeTextActive,
                              ]}
                            >
                              {stn.tag}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Feed Header: Title & Sort Trigger */}
            <View style={styles.feedHeaderRow}>
              <Text style={styles.feedHeaderTitle}>{headingTitle}</Text>

              <TouchableOpacity
                style={styles.sortTriggerBtn}
                onPress={() => setSortModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-vertical" size={13} color="#9E3C1B" />
                <Text style={styles.sortTriggerText} numberOfLines={1}>
                  {sortOption === 'Night journeys first'
                    ? 'Night first'
                    : sortOption === 'Departure time'
                    ? 'Departure'
                    : sortOption === 'Arrival time'
                    ? 'Arrival'
                    : 'Duration'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item, index }) => renderExplorerCard(item, index)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="train-outline" size={44} color="#A8998E" />
            <Text style={styles.emptyTitle}>No trains matching filters</Text>
            <Text style={styles.emptySubtitle}>Try choosing another station or corridor</Text>
          </View>
        }
      />

      {/* Unified Search & Journey Modal */}
      <SearchJourneyModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectTrain={handleTrainPress}
        onSelectStation={handleSelectStation}
      />

      {/* 60-Day Advance Booking Calendar Modal */}
      <AdvanceBookingCalendarModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
      />

      {/* Sort Options Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sortOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.sortSheet}>
            <Text style={styles.sortSheetTitle}>Sort Trains By</Text>
            {SORT_OPTIONS.map(opt => {
              const label =
                opt === 'Night journeys first'
                  ? 'Night journeys first (Preferred)'
                  : opt === 'Departure time'
                  ? 'Departure time (Earliest first)'
                  : opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={styles.sortOptionItem}
                  onPress={() => {
                    setSortOption(opt);
                    setSortModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortOption === opt && styles.sortOptionTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  {sortOption === opt && (
                    <Ionicons name="checkmark" size={18} color="#9E3C1B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TrainsHomeScreen;

const styles = StyleSheet.create({
  // ── Layout & Header ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FAF7F4',
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5ECE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.3,
  },
  bookingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  bookingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingBannerLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6E5D53',
  },
  bookingBannerDate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9E3C1B',
    letterSpacing: -0.1,
  },
  bookingBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listHeader: {
    paddingBottom: 6,
  },

  // ── Search Bar ───────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E8DED6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 18,
  },
  searchBarIcon: {
    marginRight: 12,
  },
  searchBarPlaceholder: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: '#8A7A70',
  },
  searchBarShortcut: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5ECE3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Corridor Hub Tabs ────────────────────────────────────────────
  hubTabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  hubTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  hubTabActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  hubTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4E46',
  },
  hubTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Station Filter Row ───────────────────────────────────────────
  stationFilterContainer: {
    marginBottom: 18,
  },
  stationFilterScroll: {
    gap: 10,
    paddingVertical: 3,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8.5,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
    gap: 7,
  },
  stationChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  stationChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3E38',
  },
  stationChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stationTagBadge: {
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stationTagBadgeActive: {
    backgroundColor: '#7A2C12',
  },
  stationTagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  stationTagBadgeTextActive: {
    color: '#FDEEE9',
  },

  // ── Feed Header Row (Title & Sort Trigger) ───────────────────────
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 6,
  },
  feedHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.2,
  },
  sortTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8DED6',
    gap: 6,
  },
  sortTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3E38',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7A70',
    marginTop: 4,
  },

  // ── Sort Modal ───────────────────────────────────────────────────
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  sortSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 14,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0EB',
  },
  sortOptionText: {
    fontSize: 15,
    color: '#4A3E38',
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: '#9E3C1B',
  },
});
