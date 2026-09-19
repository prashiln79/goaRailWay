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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Train } from '../types/Train';
import { trainService } from '../services/trainService';
import { TrainCard } from '../components/TrainCard';
import { SearchJourneyModal } from '../components/SearchJourneyModal';
import DateSelector from '../components/DateSelector';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCorridorStore } from '../store/corridorStore';

import {
  CorridorHubId,
  HubStation,
  CorridorHub,
  CORRIDOR_HUBS,
} from '../data/corridorHubs';
import {
  TimingFilter,
  SortType,
  TIMING_FILTER_OPTIONS,
  SORT_OPTIONS,
  filterAndSortTrains,
  getContextualSegment,
} from '../utils/trainFilterUtils';

// Re-export domain types and constants for backward compatibility
export { CorridorHubId, HubStation, CorridorHub, CORRIDOR_HUBS };

type TrainsHomeNavProp = StackNavigationProp<RootStackParamList>;

export const TrainsHomeScreen: React.FC = () => {
  const navigation = useNavigation<TrainsHomeNavProp>();
  const insets = useSafeAreaInsets();

  // ── State ────────────────────────────────────────────────────────
  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-09-17');

  // Filters & Sorting: Major Corridor Hubs + Dynamic Station Sub-menu
  const { selectedHub, setSelectedHub } = useCorridorStore();
  const [selectedStationCode, setSelectedStationCode] = useState<string | null>(
    selectedHub === 'Mumbai' ? 'ALL_MUMBAI' : 'ALL_GOA',
  );
  const [timingFilter, setTimingFilter] = useState<TimingFilter>('All');
  const [sortOption, setSortOption] = useState<SortType>('Night journeys first');

  // Modals
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

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
      timingFilter,
      sortOption,
    });
  }, [allTrains, selectedHub, selectedStationCode, timingFilter, sortOption]);

  const headingTitle = useMemo(() => {
    if (activeStationObj && !activeStationObj.code.startsWith('ALL_')) {
      const dirLabel = selectedHub === 'Mumbai' ? '→ MUMBAI' : selectedHub === 'Goa' ? '→ GOA' : '';
      return `${dirLabel ? dirLabel + ' · ' : ''}${activeStationObj.name.toUpperCase()} (${filteredTrains.length})`;
    }
    const dirLabel =
      selectedHub === 'Mumbai'
        ? 'TRAINS TO MUMBAI'
        : selectedHub === 'Goa'
        ? 'TRAINS TO GOA'
        : `${selectedHub.toUpperCase()} TRAINS`;
    return `${dirLabel} (${filteredTrains.length})`;
  }, [selectedHub, activeStationObj, filteredTrains.length]);

  // ── Train Card Renderer ──────────────────────────────────────────
  const renderExplorerCard = useCallback(
    (train: Train) => {
      const segment = getContextualSegment(train, selectedHub, selectedStationCode);
      return (
        <TrainCard
          key={train.trainNumber}
          train={train}
          onPress={handleTrainPress}
          segment={segment}
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
        <View style={styles.headerTitles}>
          <Text style={styles.appName}>Konkan Train Planner</Text>
          <Text style={styles.appTagline}>Explore Konkan trains</Text>
          <Text style={styles.appSubTagline}>Mumbai • Konkan • Goa</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="train" size={26} color="#9E3C1B" />
        </View>
      </View>

      {/* Train Feed */}
      <FlatList
        data={filteredTrains}
        keyExtractor={item => `feed-train-${item.trainNumber}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        ListHeaderComponent={
          <View>
            {/* Search Bar Button */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={18} color="#8A4A1C" style={styles.searchBarIcon} />
              <Text style={styles.searchBarPlaceholder}>
                Search train, station or destination
              </Text>
              <View style={styles.searchBarShortcut}>
                <Ionicons name="options-outline" size={14} color="#8A4A1C" />
              </View>
            </TouchableOpacity>

            {/* Compact Date Control */}
            <View style={styles.dateBar}>
              <View style={styles.dateLeft}>
                <Text style={styles.dateOverline}>TODAY</Text>
                <Text style={styles.dateTitle}>17 Sep 2026</Text>
              </View>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setDateModalVisible(prev => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={16} color="#9E3C1B" />
                <Text style={styles.datePickerBtnText}>Select Date</Text>
              </TouchableOpacity>
            </View>

            {/* Expandable Date Selector */}
            {dateModalVisible && (
              <View style={styles.dateSelectorWrap}>
                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={d => {
                    setSelectedDate(d);
                    setDateModalVisible(false);
                  }}
                  onOpenCalendar={() => {}}
                />
              </View>
            )}

            {/* Major Corridor Hub Chips */}
            <View style={styles.chipsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CORRIDOR_HUBS.map(hub => {
                  const isActive = selectedHub === hub.id;
                  return (
                    <TouchableOpacity
                      key={hub.id}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => handleHubSelect(hub.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={hub.icon}
                        size={14}
                        color={isActive ? '#FFFFFF' : '#8A4A1C'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}
                      >
                        {hub.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Dynamic Station Sub-Menu (Appears when a Hub is selected) */}
            {activeHub && activeHub.stations.length > 0 && (
              <View style={styles.stationMenuContainer}>
                <View style={styles.stationMenuHeader}>
                  <Text style={styles.stationMenuOverline}>
                    {activeHub.label.toUpperCase()} STATIONS
                  </Text>
                  <Text style={styles.stationMenuTip}>Tap station to filter</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.stationMenuScroll}
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

            {/* Timing Sort & Filter Chips */}
            <View style={styles.timingSection}>
              <View style={styles.timingHeaderRow}>
                <Text style={styles.sectionOverline}>DEPARTURE TIME</Text>
                <TouchableOpacity
                  style={styles.sortTriggerBtn}
                  onPress={() => setSortModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-vertical" size={13} color="#9E3C1B" />
                  <Text style={styles.sortTriggerText}>Sort: {sortOption}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timingScroll}
              >
                {TIMING_FILTER_OPTIONS.map(t => {
                  const isActive = timingFilter === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.timingChip, isActive && styles.timingChipActive]}
                      onPress={() => setTimingFilter(t.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.timingChipText,
                          isActive && styles.timingChipTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Section Divider & All Trains Header */}
            <View style={styles.allTrainsHeadingRow}>
              <Text style={styles.sectionTitle}>{headingTitle}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => renderExplorerCard(item)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="train-outline" size={44} color="#A8998E" />
            <Text style={styles.emptyTitle}>No trains matching filters</Text>
            <Text style={styles.emptySubtitle}>Try changing the timing filter or category</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FAF7F4',
  },
  headerTitles: {
    flex: 1,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.4,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E3C1B',
    marginTop: 2,
  },
  appSubTagline: {
    fontSize: 12,
    color: '#7A6B63',
    marginTop: 1,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE5DC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  // ── Search Bar ───────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E8DED6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  searchBarIcon: {
    marginRight: 10,
  },
  searchBarPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#A8998E',
  },
  searchBarShortcut: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Date Control ─────────────────────────────────────────────────
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginBottom: 12,
  },
  dateLeft: {},
  dateOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E3C1B',
    letterSpacing: 0.8,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
    marginTop: 1,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCEFE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  dateSelectorWrap: {
    marginBottom: 12,
  },

  // ── Corridor Hub Chips ───────────────────────────────────────────
  chipsContainer: {
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  categoryChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4E46',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Dynamic Station Sub-menu ─────────────────────────────────────
  stationMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    padding: 10,
    marginBottom: 12,
  },
  stationMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  stationMenuOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E3C1B',
    letterSpacing: 0.8,
  },
  stationMenuTip: {
    fontSize: 11,
    color: '#8A7A70',
  },
  stationMenuScroll: {
    gap: 8,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F7EFE8',
    borderWidth: 1,
    borderColor: '#EFE5DC',
    gap: 6,
  },
  stationChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  stationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3E38',
  },
  stationChipTextActive: {
    color: '#FFFFFF',
  },
  stationTagBadge: {
    backgroundColor: '#EBE2D8',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  stationTagBadgeActive: {
    backgroundColor: '#7A2C12',
  },
  stationTagBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  stationTagBadgeTextActive: {
    color: '#FDEEE9',
  },

  // ── Timing Section & Sort Trigger ────────────────────────────────
  timingSection: {
    marginBottom: 16,
  },
  timingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.8,
  },
  sortTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3C1B',
  },
  timingScroll: {
    gap: 6,
  },
  timingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F0EB',
  },
  timingChipActive: {
    backgroundColor: '#FCEFE9',
    borderWidth: 1,
    borderColor: '#9E3C1B',
  },
  timingChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4E46',
  },
  timingChipTextActive: {
    color: '#9E3C1B',
    fontWeight: '700',
  },

  // ── Section Title & List Feed ────────────────────────────────────
  allTrainsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: 0.8,
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
