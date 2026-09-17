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
import { Station } from '../types/Station';
import { ConnectionOption } from '../types/Connection';
import { trainService } from '../services/trainService';
import { STATION_MAP, STATIONS } from '../data/stations';
import { MOCK_CONNECTIONS } from '../data/connections';
import TrainCard from '../components/TrainCard';
import ConnectionCard from '../components/ConnectionCard';
import DateSelector from '../components/DateSelector';
import SearchStationModal from '../components/SearchStationModal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NEARBY_ALTERNATIVE_STATIONS_DATA } from '../data/stationAlternatives';
import { StationOption } from '../types/JourneyResult';

type TrainsHomeNavProp = StackNavigationProp<RootStackParamList>;

type FilterType = 'All' | 'Goa' | 'Nearby' | 'Direct' | 'Connections';
type SortType = 'Departure time' | 'Arrival time' | 'Journey duration' | 'Availability';

type ListItem =
  | {
      type: 'train';
      data: Train;
      destinationType: 'GOA' | 'NEARBY';
      fromStationCode: string;
      toStationCode: string;
      departureTime: string;
      arrivalTime: string;
      dayOffset: number;
      duration: string;
      durationMinutes: number;
      distanceLabel?: string;
      alternativeFor?: string;
      roadTravelTip?: string;
    }
  | { type: 'connection'; data: ConnectionOption };

// Helper to compute duration string & minutes
function computeDurationAndOffset(
  depTime: string,
  arrTime: string,
  fromDayOffset: number = 0,
  toDayOffset: number = 0,
) {
  const [dh, dm] = depTime.split(':').map(Number);
  const [ah, am] = arrTime.split(':').map(Number);
  const depTotal = fromDayOffset * 24 * 60 + dh * 60 + dm;
  const arrTotal = toDayOffset * 24 * 60 + ah * 60 + am;
  let diffMinutes = arrTotal - depTotal;
  if (diffMinutes < 0) diffMinutes += 24 * 60;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const durationStr = `${hours}h ${mins.toString().padStart(2, '0')}m`;
  return { durationStr, diffMinutes, dayOffset: toDayOffset - fromDayOffset };
}

export const TrainsHomeScreen: React.FC = () => {
  const navigation = useNavigation<TrainsHomeNavProp>();
  const insets = useSafeAreaInsets();

  // Search Parameters
  const [fromStation, setFromStation] = useState<StationOption>({
    code: 'LTT',
    name: 'Mumbai LTT',
    state: 'Maharashtra',
  });
  const [toStation, setToStation] = useState<StationOption>({
    code: 'GOA_NORTH',
    name: 'North Goa',
    state: 'Goa',
    isArea: true,
    areaType: 'GOA_NORTH',
    subtitle: 'Includes Thivim & nearby (Sawantwadi, Kudal, Kankavli, Belagavi)',
  });
  const [selectedDate, setSelectedDate] = useState('2026-09-17');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [sortOption, setSortOption] = useState<SortType>('Departure time');

  // Modals
  const [stationPickerMode, setStationPickerMode] = useState<'from' | 'to' | null>(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedConnectionForModal, setSelectedConnectionForModal] = useState<ConnectionOption | null>(null);

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

  // Build unified items list (Direct Trains to Goa + Nearby Alternatives + Connection options)
  const unifiedItems = useMemo<ListItem[]>(() => {
    // 1. Determine destination target stations based on selection
    // Goa station codes vs Alternative station codes
    let goaCodes: string[] = [];
    let nearbyCodes: string[] = [];

    if (toStation.isArea) {
      if (toStation.areaType === 'GOA_NORTH') {
        goaCodes = ['THVM', 'KRMI', 'PER', 'MAO'];
        nearbyCodes = ['SWV', 'KUDL', 'KKW', 'LD', 'BGM'];
      } else if (toStation.areaType === 'GOA_SOUTH') {
        goaCodes = ['MAO', 'CNO', 'VSG', 'SVDEM'];
        nearbyCodes = ['KAWR', 'KARW', 'LD'];
      } else {
        // GOA_ALL
        goaCodes = ['THVM', 'KRMI', 'PER', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'];
        nearbyCodes = ['SWV', 'KUDL', 'KKW', 'LD', 'BGM', 'KAWR', 'KARW'];
      }
    } else {
      // Specific station selected
      const isNearbyAlt = NEARBY_ALTERNATIVE_STATIONS_DATA.find(
        a => a.code === toStation.code || (toStation.code === 'KARW' && a.code === 'KAWR'),
      );
      if (isNearbyAlt) {
        nearbyCodes = [toStation.code];
        if (toStation.code === 'KARW') nearbyCodes.push('KAWR');
      } else {
        goaCodes = [toStation.code];
      }
    }

    const fromCode = fromStation.code;

    // Direct train items
    type TrainListItem = Extract<ListItem, { type: 'train' }>;
    const trainResults: TrainListItem[] = [];

    allTrains.forEach(train => {
      // Check if train has the origin stop
      const fromStopIdx = train.stops.findIndex(s => s.stationCode === fromCode);
      // If fromStation is generic or not in stops, check if origin is Mumbai-area
      let effectiveFromStop = fromStopIdx >= 0 ? train.stops[fromStopIdx] : null;
      let effectiveFromIdx = fromStopIdx;

      if (!effectiveFromStop) {
        // Fallback: If user searched Mumbai LTT/CSMT/PNVL, match any Mumbai origin if train starts there
        if (['LTT', 'CSMT', 'PNVL', 'BCT', 'BDTS'].includes(fromCode)) {
          const mIdx = train.stops.findIndex(s => ['LTT', 'CSMT', 'PNVL', 'ROHA'].includes(s.stationCode));
          if (mIdx >= 0) {
            effectiveFromStop = train.stops[mIdx];
            effectiveFromIdx = mIdx;
          }
        }
      }

      if (!effectiveFromStop || effectiveFromIdx < 0) {
        // If fromStation not matched, fallback to train's first stop
        effectiveFromStop = train.stops[0];
        effectiveFromIdx = 0;
      }

      // Check for matching Goa stops
      let matchedGoaStop = null;
      for (let i = effectiveFromIdx + 1; i < train.stops.length; i++) {
        if (goaCodes.includes(train.stops[i].stationCode)) {
          matchedGoaStop = train.stops[i];
          break;
        }
      }

      // Check for matching Nearby stops
      let matchedNearbyStop = null;
      for (let i = effectiveFromIdx + 1; i < train.stops.length; i++) {
        if (nearbyCodes.includes(train.stops[i].stationCode)) {
          matchedNearbyStop = train.stops[i];
          break;
        }
      }

      // If both matched, prefer Goa stop, but we can also add nearby if Goa is not the sole destination
      if (matchedGoaStop) {
        const depTime = effectiveFromStop.departureTime ?? '00:00';
        const arrTime = matchedGoaStop.arrivalTime ?? matchedGoaStop.departureTime ?? '00:00';
        const { durationStr, diffMinutes, dayOffset } = computeDurationAndOffset(
          depTime,
          arrTime,
          effectiveFromStop.dayOffset,
          matchedGoaStop.dayOffset,
        );

        trainResults.push({
          type: 'train',
          data: train,
          destinationType: 'GOA',
          fromStationCode: effectiveFromStop.stationCode,
          toStationCode: matchedGoaStop.stationCode,
          departureTime: depTime,
          arrivalTime: arrTime,
          dayOffset,
          duration: durationStr,
          durationMinutes: diffMinutes,
        });
      } else if (matchedNearbyStop) {
        // Train terminates or stops only at nearby alternative station (e.g. Konkan Kanya terminating at Kudal)
        const altInfo = NEARBY_ALTERNATIVE_STATIONS_DATA.find(
          a => a.code === matchedNearbyStop.stationCode || (matchedNearbyStop.stationCode === 'KARW' && a.code === 'KAWR'),
        );
        const depTime = effectiveFromStop.departureTime ?? '00:00';
        const arrTime = matchedNearbyStop.arrivalTime ?? matchedNearbyStop.departureTime ?? '00:00';
        const { durationStr, diffMinutes, dayOffset } = computeDurationAndOffset(
          depTime,
          arrTime,
          effectiveFromStop.dayOffset,
          matchedNearbyStop.dayOffset,
        );

        trainResults.push({
          type: 'train',
          data: train,
          destinationType: 'NEARBY',
          fromStationCode: effectiveFromStop.stationCode,
          toStationCode: matchedNearbyStop.stationCode,
          departureTime: depTime,
          arrivalTime: arrTime,
          dayOffset,
          duration: durationStr,
          durationMinutes: diffMinutes,
          distanceLabel: altInfo?.distanceLabel ?? `${altInfo?.distanceKm ?? 40} km from destination`,
          alternativeFor: altInfo?.alternativeFor ?? 'Alternative station',
          roadTravelTip: altInfo?.roadTip ?? 'Continue to destination by road',
        });
      }
    });

    // Also include nearby alternative options for major trains to allow comparison when Goa tickets are full
    // (e.g. Matsyagandha stopping at Sawantwadi Road before Thivim)
    if (toStation.isArea && nearbyCodes.length > 0) {
      allTrains.forEach(train => {
        // Check if train already added as nearby; if not, check if it stops at SWV or KUDL
        const hasNearbyStop = train.stops.find(s => ['SWV', 'KUDL', 'KKW'].includes(s.stationCode));
        if (hasNearbyStop) {
          const effectiveFromStop = train.stops[0];
          const depTime = effectiveFromStop.departureTime ?? '00:00';
          const arrTime = hasNearbyStop.arrivalTime ?? hasNearbyStop.departureTime ?? '00:00';
          const { durationStr, diffMinutes, dayOffset } = computeDurationAndOffset(
            depTime,
            arrTime,
            effectiveFromStop.dayOffset,
            hasNearbyStop.dayOffset,
          );

          // Add only if train terminates there or as a distinct alternative option
          if (train.destinationStationCode === hasNearbyStop.stationCode) {
            // Already added above if matched
          } else if (
            // Add Matsyagandha to Sawantwadi Road as requested in the user prompt example!
            train.trainNumber === '12619' && hasNearbyStop.stationCode === 'SWV'
          ) {
            trainResults.push({
              type: 'train',
              data: train,
              destinationType: 'NEARBY',
              fromStationCode: effectiveFromStop.stationCode,
              toStationCode: hasNearbyStop.stationCode,
              departureTime: depTime,
              arrivalTime: arrTime,
              dayOffset,
              duration: durationStr,
              durationMinutes: diffMinutes,
              distanceLabel: '38 km from North Goa',
              alternativeFor: 'Alternative station',
              roadTravelTip: 'Continue to North Goa by road',
            });
          }
        }
      });
    }

    // Connections options
    const connectionResults: ListItem[] = MOCK_CONNECTIONS.filter(
      c => c.type === 'connecting',
    ).map(c => ({ type: 'connection' as const, data: c }));

    // Apply sorting
    const sortedTrains = [...trainResults].sort((a, b) => {
      if (sortOption === 'Departure time') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortOption === 'Arrival time') {
        return a.arrivalTime.localeCompare(b.arrivalTime);
      }
      if (sortOption === 'Journey duration') {
        return a.durationMinutes - b.durationMinutes;
      }
      return 0;
    });

    // Apply filter: [All] [Goa] [Nearby] [Direct] [Connections]
    if (activeFilter === 'Goa') {
      return sortedTrains.filter(item => item.destinationType === 'GOA');
    }
    if (activeFilter === 'Nearby') {
      return sortedTrains.filter(item => item.destinationType === 'NEARBY');
    }
    if (activeFilter === 'Direct') {
      return sortedTrains;
    }
    if (activeFilter === 'Connections') {
      return connectionResults;
    }

    // 'All' -> Interleave direct Goa, nearby alternatives, and smart connection options
    const goaList = sortedTrains.filter(t => t.destinationType === 'GOA');
    const nearbyList = sortedTrains.filter(t => t.destinationType === 'NEARBY');

    const combined: ListItem[] = [];
    // Interleave: Nearby top pick (like Matsyagandha -> SWV or Konkan Kanya), Goa trains, connections
    if (nearbyList.length > 0) {
      combined.push(nearbyList[0]);
    }
    if (goaList.length > 0) {
      combined.push(goaList[0]);
    }
    if (connectionResults.length > 0) {
      combined.push(connectionResults[0]);
    }
    if (goaList.length > 1) {
      combined.push(...goaList.slice(1, 3));
    }
    if (nearbyList.length > 1) {
      combined.push(...nearbyList.slice(1));
    }
    if (goaList.length > 3) {
      combined.push(...goaList.slice(3));
    }
    if (connectionResults.length > 1) {
      combined.push(...connectionResults.slice(1));
    }

    return combined.length > 0 ? combined : sortedTrains;
  }, [allTrains, fromStation, toStation, activeFilter, sortOption]);

  const handleTrainPress = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const handleConnectionDetails = useCallback(
    (trainNumber: string) => {
      navigation.navigate('TrainDetails', { trainNumber });
    },
    [navigation],
  );

  const handleConnectionAvailability = useCallback(
    (option: ConnectionOption) => {
      setSelectedConnectionForModal(option);
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brandIconBox}>
            <Ionicons name="train" size={30} color="#9E3C1B" />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Goa Train Planner</Text>
            <Text style={styles.subtitle}>Direct trains & connecting options</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={unifiedItems}
        keyExtractor={(item, idx) =>
          item.type === 'train' ? `train-${item.data.trainNumber}` : `conn-${item.data.id}-${idx}`
        }
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
                    {toStation?.isArea ? (
                      <View style={styles.areaBadgeSmall}>
                        <Ionicons name="sparkles" size={10} color="#9E3C1B" />
                        <Text style={styles.areaBadgeSmallText}>Goa + Alternatives</Text>
                      </View>
                    ) : (
                      <View style={styles.codeBadgeSmall}>
                        <Text style={styles.codeBadgeSmallText}>{toStation?.code}</Text>
                      </View>
                    )}
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

            {/* Filter Chips: All | Goa | Nearby | Direct | Connections */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {(['All', 'Goa', 'Nearby', 'Direct', 'Connections'] as FilterType[]).map(
                filter => {
                  const isActive = activeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() => setActiveFilter(filter)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </ScrollView>

            {/* Results Count & Sort Row */}
            <View style={styles.metaRow}>
              <Text style={styles.countText}>
                {unifiedItems.length} direct / alternative options
              </Text>
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
        renderItem={({ item }) => {
          if (item.type === 'train') {
            return (
              <TrainCard
                train={item.data}
                selectedFrom={item.fromStationCode}
                selectedTo={item.toStationCode}
                destinationType={item.destinationType}
                distanceLabel={item.distanceLabel}
                alternativeFor={item.alternativeFor}
                roadTravelTip={item.roadTravelTip}
                computedDuration={item.duration}
                onPress={handleTrainPress}
              />
            );
          }
          return (
            <ConnectionCard
              option={item.data}
              onPressDetails={handleConnectionDetails}
              onCheckAvailability={handleConnectionAvailability}
            />
          );
        }}
      />

      {/* Station Picker Modal */}
      <SearchStationModal
        visible={stationPickerMode !== null}
        title={stationPickerMode === 'from' ? 'Select Origin Station' : 'Select Destination Station'}
        isDestination={stationPickerMode === 'to'}
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
            <Text style={styles.sortSheetTitle}>Sort Options By</Text>
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

      {/* Connection Journey Detail Modal */}
      <Modal
        visible={selectedConnectionForModal !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Journey Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedConnectionForModal(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color="#2C201A" />
              </TouchableOpacity>
            </View>

            {selectedConnectionForModal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.strategySubheader}>
                  Combined 2-train journey with guaranteed transfer window:
                </Text>

                {selectedConnectionForModal.segments.map((seg, idx) => (
                  <View key={seg.trainNumber} style={styles.modalSegmentCard}>
                    <View style={styles.segBadgeRow}>
                      <View style={styles.segBadge}>
                        <Text style={styles.segBadgeText}>Train {idx + 1}</Text>
                      </View>
                      <View style={styles.availPill}>
                        <Text style={styles.availPillText}>{seg.availabilitySample ?? 'Available'}</Text>
                      </View>
                    </View>
                    <Text style={styles.segTrainName}>
                      {seg.trainNumber} {seg.trainName}
                    </Text>
                    <Text style={styles.segStations}>
                      {seg.fromStationCode} ({seg.departureTime}) → {seg.toStationCode} ({seg.arrivalTime})
                    </Text>
                    <Text style={styles.segDuration}>Duration: {seg.duration}</Text>
                  </View>
                ))}

                <View style={styles.disclaimerBox}>
                  <Ionicons name="shield-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.disclaimerText}>
                    Separate journey segments have independent seat inventories. If direct tickets are waitlisted, splitting the journey often yields confirmed seats.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCta}
                  onPress={() => {
                    const tNum = selectedConnectionForModal.segments[0].trainNumber;
                    setSelectedConnectionForModal(null);
                    navigation.navigate('Availability', { trainNumber: tNum });
                  }}
                >
                  <Text style={styles.modalCtaText}>Check Train 1 Availability</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: '#F8D8CB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
    fontWeight: '500',
  },
  corridorBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7E1',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  corridorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A4A1C',
    letterSpacing: 0.3,
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
  areaBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2E9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#F8D8CB',
  },
  areaBadgeSmallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  codeBadgeSmall: {
    backgroundColor: '#F7F3F0',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  codeBadgeSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B584E',
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
  filtersScroll: {
    paddingHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#9E3C1B',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
  },
  strategySubheader: {
    fontSize: 14,
    color: '#7A6B63',
    marginBottom: 12,
    fontWeight: '500',
  },
  modalSegmentCard: {
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  segBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  segBadge: {
    backgroundColor: '#9E3C1B',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  segBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  availPill: {
    backgroundColor: '#EBF7EE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  availPillText: {
    color: '#1E824C',
    fontSize: 12,
    fontWeight: '700',
  },
  segTrainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  segStations: {
    fontSize: 13,
    color: '#7A6B63',
    marginTop: 2,
  },
  segDuration: {
    fontSize: 12,
    color: '#A0938C',
    marginTop: 4,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginVertical: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#8A4A1C',
    flex: 1,
    lineHeight: 16,
  },
  modalCta: {
    backgroundColor: '#9E3C1B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  modalCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
