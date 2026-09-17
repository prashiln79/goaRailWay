import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { trainService } from '../services/trainService';
import { STATION_MAP, STATIONS } from '../data/stations';
import TrainCard from '../components/TrainCard';
import DateSelector from '../components/DateSelector';
import SearchStationModal from '../components/SearchStationModal';
import { RootStackParamList } from '../navigation/AppNavigator';

type TrainsHomeNavProp = StackNavigationProp<RootStackParamList>;

type FilterType = 'All trains' | 'Direct' | 'Connections' | 'Tatkal';
type SortType = 'Departure time' | 'Arrival time' | 'Journey duration' | 'Availability';

export const TrainsHomeScreen: React.FC = () => {
  const navigation = useNavigation<TrainsHomeNavProp>();
  const insets = useSafeAreaInsets();

  // Search Parameters
  const [fromStation, setFromStation] = useState<Station>(
    STATION_MAP['LTT'] ?? STATIONS.find(s => s.code === 'LTT')!,
  );
  const [toStation, setToStation] = useState<Station>(
    STATION_MAP['THVM'] ?? STATIONS.find(s => s.code === 'THVM')!,
  );
  const [selectedDate, setSelectedDate] = useState('2026-09-17');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All trains');
  const [sortOption, setSortOption] = useState<SortType>('Departure time');

  // Modals
  const [stationPickerMode, setStationPickerMode] = useState<'from' | 'to' | null>(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [allTrains, setAllTrains] = useState<Train[]>([]);

  useEffect(() => {
    trainService.getAllTrains().then(trains => {
      setAllTrains(trains);
    });
  }, []);

  // Swap From / To
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Filtered & Sorted Trains
  const filteredTrains = useMemo(() => {
    let list = [...allTrains];

    // Check if trains stop at or between from & to
    if (activeFilter === 'Direct') {
      list = list.filter(t => {
        const fromIdx = t.stops.findIndex(s => s.stationCode === fromStation.code);
        const toIdx = t.stops.findIndex(s => s.stationCode === toStation.code);
        return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
      });
      // If none strictly match the specific pair in mock data, show direct trains to Goa
      if (list.length === 0) {
        list = allTrains.filter(t => t.stops.some(s => ['THVM', 'KRMI', 'MAO'].includes(s.stationCode)));
      }
    } else if (activeFilter === 'Tatkal') {
      // Trains with Tatkal quota (daily and express trains)
      list = list.filter(t => t.type === 'Express' || t.type === 'Rajdhani');
    }

    // Sort
    if (sortOption === 'Departure time') {
      list.sort((a, b) => {
        const aDep = a.stops[0]?.departureTime ?? '00:00';
        const bDep = b.stops[0]?.departureTime ?? '00:00';
        return aDep.localeCompare(bDep);
      });
    } else if (sortOption === 'Arrival time') {
      list.sort((a, b) => {
        const aArr = a.stops[a.stops.length - 1]?.arrivalTime ?? '00:00';
        const bArr = b.stops[b.stops.length - 1]?.arrivalTime ?? '00:00';
        return aArr.localeCompare(bArr);
      });
    }

    return list;
  }, [allTrains, activeFilter, sortOption, fromStation, toStation]);

  const handleTrainPress = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const handleFilterPress = (filter: FilterType) => {
    if (filter === 'Connections') {
      // Directly switch to Connections tab or screen
      navigation.navigate('Connections');
      return;
    }
    setActiveFilter(filter);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Konkan Train Planner</Text>
          <Text style={styles.subtitle}>Find trains and better connection options</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color="#4A3B32" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTrains}
        keyExtractor={item => item.trainNumber}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 80 }]}
        ListHeaderComponent={
          <View>
            {/* Search Card */}
            <View style={styles.searchCard}>
              {/* FROM Section */}
              <TouchableOpacity
                style={styles.stationSelectRow}
                onPress={() => setStationPickerMode('from')}
                activeOpacity={0.7}
              >
                <View style={styles.stationTextGroup}>
                  <Text style={styles.fieldLabel}>FROM</Text>
                  <View style={styles.stationNameRow}>
                    <Ionicons name="location" size={16} color="#8A4A1C" style={styles.stationIcon} />
                    <Text style={styles.stationNameText}>
                      {fromStation?.name ?? 'Select Station'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Swap Button Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <TouchableOpacity
                  style={styles.swapButton}
                  onPress={handleSwapStations}
                  activeOpacity={0.8}
                >
                  <Ionicons name="swap-vertical" size={18} color="#8A4A1C" />
                </TouchableOpacity>
              </View>

              {/* TO Section */}
              <TouchableOpacity
                style={styles.stationSelectRow}
                onPress={() => setStationPickerMode('to')}
                activeOpacity={0.7}
              >
                <View style={styles.stationTextGroup}>
                  <Text style={styles.fieldLabel}>TO</Text>
                  <View style={styles.stationNameRow}>
                    <Ionicons name="pin" size={16} color="#8A4A1C" style={styles.stationIcon} />
                    <Text style={styles.stationNameText}>
                      {toStation?.name ?? 'Select Station'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Journey Date Preview */}
              <View style={styles.dateRow}>
                <Text style={styles.fieldLabel}>JOURNEY DATE</Text>
                <View style={styles.dateDisplay}>
                  <Ionicons name="calendar-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.dateDisplayText}>17 Sep 2026 (Thu)</Text>
                </View>
              </View>
            </View>

            {/* Horizontal Date Selector */}
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenCalendar={() => {}}
            />

            {/* Quick Filters */}
            <View style={styles.filtersRow}>
              {(['All trains', 'Direct', 'Connections', 'Tatkal'] as FilterType[]).map(filter => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => handleFilterPress(filter)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Results Count & Sort Row */}
            <View style={styles.metaRow}>
              <Text style={styles.countText}>{filteredTrains.length} trains found</Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.sortText}>Sort: {sortOption} ↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TrainCard
            train={item}
            selectedFrom={fromStation.code}
            selectedTo={toStation.code}
            onPress={handleTrainPress}
          />
        )}
      />

      {/* Station Picker Modal */}
      <SearchStationModal
        visible={stationPickerMode !== null}
        title={stationPickerMode === 'from' ? 'Select Origin Station' : 'Select Destination Station'}
        onClose={() => setStationPickerMode(null)}
        onSelectStation={station => {
          if (stationPickerMode === 'from') {
            setFromStation(station);
          } else {
            setToStation(station);
          }
        }}
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
            {(['Departure time', 'Arrival time', 'Journey duration', 'Availability'] as SortType[]).map(
              opt => (
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
                    {opt}
                  </Text>
                  {sortOption === opt && (
                    <Ionicons name="checkmark" size={18} color="#9E3C1B" />
                  )}
                </TouchableOpacity>
              ),
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TrainsHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#8A7A71',
    marginTop: 2,
    fontWeight: '500',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingTop: 4,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EFE7E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  stationSelectRow: {
    paddingVertical: 6,
  },
  stationTextGroup: {},
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0938C',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  stationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationIcon: {
    marginRight: 8,
  },
  stationNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C201A',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0EAE4',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7EEE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  dateRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F6F0EC',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dateDisplayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#9E3C1B', // Rich Terracotta as in reference UI
    borderColor: '#9E3C1B',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B584E',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#382A22',
  },
  sortBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sortSheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  sortSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 14,
  },
  sortOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFEA',
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A3B32',
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: '#9E3C1B',
  },
});
